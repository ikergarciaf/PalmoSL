"""Generacion de respuestas corporativas con Gemini."""

from __future__ import annotations

import logging
from typing import Any

from google import genai
from jinja2 import Template

from config import LOGGER_NAME, Settings
from modulo1_email.models import EmailClassification, EmailMessage, EmailResponse, ProductContext
from modulo1_email.utils import load_prompt


logger = logging.getLogger(LOGGER_NAME)


class EmailResponder:
    """Genera respuestas profesionales en espanol."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.prompt_template = Template(load_prompt(settings.prompts_dir / "respuesta.txt"))
        template_path = settings.templates_dir / "email_respuesta.html"
        self.email_template = Template(template_path.read_text(encoding="utf-8"))

    def generate(
        self,
        email: EmailMessage,
        classification: EmailClassification,
        product_context: ProductContext,
        escalated: bool,
    ) -> EmailResponse:
        """Genera respuesta final para cliente o acuse de escalado."""

        if escalated:
            body = self.email_template.render(
                cuerpo=(
                    "Gracias por contactar con Palmo Suministro Integral. "
                    "Hemos recibido su consulta y la hemos derivado a nuestro equipo especializado "
                    "para revisarla con detalle. Le responderemos con una solucion concreta lo antes posible."
                )
            )
            return EmailResponse(
                email_id=email.id,
                to_email=email.from_email,
                subject=f"Re: {email.subject}",
                body=body,
                escalated=True,
                metadata={"classification": classification.categoria},
            )

        if self.settings.gemini_api_key:
            try:
                return self._generate_with_gemini(email, classification, product_context)
            except Exception:
                logger.exception("Gemini fallo generando respuesta; usando fallback")

        body = self.email_template.render(
            cuerpo=self._build_mock_body(classification, product_context)
        )
        return EmailResponse(
            email_id=email.id,
            to_email=email.from_email,
            subject=f"Re: {email.subject}",
            body=body,
            escalated=False,
            metadata={
                "classification": classification.categoria,
                "matches": len(product_context.matches),
            },
        )

    def _generate_with_gemini(
        self,
        email: EmailMessage,
        classification: EmailClassification,
        product_context: ProductContext,
    ) -> EmailResponse:
        """Usa Gemini para redactar una respuesta."""

        prompt = self.prompt_template.render(
            subject=email.subject,
            body=email.body,
            classification=classification,
            product_context=product_context.matches,
        )
        client = genai.Client(api_key=self.settings.gemini_api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = response.text
        return EmailResponse(
            email_id=email.id,
            to_email=email.from_email,
            subject=f"Re: {email.subject}",
            body=text.strip(),
            escalated=False,
            metadata={"classification": classification.categoria},
        )

    @staticmethod
    def _build_mock_body(classification: EmailClassification, context: ProductContext) -> str:
        """Construye respuesta fiable sin LLM."""

        if not context.matches:
            return (
                "Gracias por su consulta. No hemos localizado una referencia exacta con la informacion facilitada. "
                "Nuestro equipo revisara alternativas equivalentes y le confirmara disponibilidad, precio y plazo."
            )

        product: dict[str, Any] = context.matches[0]
        stock = int(product.get("stock_actual", 0))
        price = float(product.get("precio_venta", 0.0))
        name  = product.get("nombre", "producto solicitado")
        sku   = product.get("sku", "")

        if classification.categoria == "stock":
            return (
                f"Actualmente disponemos de {stock} unidades de {name} ({sku}). "
                "Podemos reservar el material y confirmar plazo de salida en cuanto nos indiquen la cantidad final."
            )
        if classification.categoria == "precio":
            return (
                f"El precio orientativo de {name} ({sku}) es {price:.2f} EUR/unidad antes de condiciones comerciales. "
                "Si nos indican volumen y frecuencia de compra, revisaremos una tarifa ajustada para distribuidor."
            )
        if classification.categoria == "compatibilidad":
            return (
                f"La referencia {sku} figura como compatible con: {product.get('compatible_con')}. "
                "Antes de cerrar el pedido, recomendamos validar el modelo exacto de impresora."
            )
        if classification.categoria == "estado_pedido":
            return (
                "Hemos recibido su solicitud de estado de pedido. "
                "Estamos verificando la informacion logistica y le enviaremos confirmacion actualizada."
            )
        return (
            f"Hemos localizado {name} ({sku}) como posible referencia relacionada. "
            "Le confirmamos disponibilidad y condiciones tras revisar los detalles de su solicitud."
        )
