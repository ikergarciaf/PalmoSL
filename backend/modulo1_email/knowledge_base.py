"""Base de conocimiento de productos."""

from __future__ import annotations

import logging
from difflib import SequenceMatcher
from typing import Any

import pandas as pd

from config import LOGGER_NAME, Settings
from modulo1_email.models import ProductContext


logger = logging.getLogger(LOGGER_NAME)


class ProductKnowledgeBase:
    """Carga productos y ofrece busqueda exacta y aproximada."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._products = self._load_products()

    def exact_search(self, query: str) -> list[dict[str, Any]]:
        """Busca por SKU exacto o nombre exacto."""

        normalized = query.strip().lower()
        if not normalized:
            return []
        frame = self._products
        mask = (frame["sku"].str.lower() == normalized) | (frame["nombre"].str.lower() == normalized)
        return frame[mask].head(10).to_dict(orient="records")

    def approximate_search(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Busca productos por similitud textual."""

        normalized = query.strip().lower()
        if not normalized:
            return []
        scored: list[tuple[float, dict[str, Any]]] = []
        tokens = [token for token in normalized.replace("-", " ").split() if len(token) > 1]
        for record in self._products.to_dict(orient="records"):
            haystack = (
                f"{record['sku']} {record['nombre']} {record['marca']} "
                f"{record['modelo_impresora']} {record['compatible_con']}"
            ).lower()
            token_score = 0.0
            if tokens:
                token_score = sum(1 for token in tokens if token in haystack) / len(tokens)
            score = max(
                SequenceMatcher(None, normalized, haystack).ratio(),
                0.95 if normalized in haystack else 0.0,
                token_score,
            )
            if score >= 0.5:
                scored.append((score, record))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [record for _, record in scored[:limit]]

    def get_context(self, query: str) -> ProductContext:
        """Devuelve contexto estructurado para generacion de respuesta."""

        exact = self.exact_search(query)
        if exact:
            return ProductContext(matches=exact, query=query, exact_match=True)
        return ProductContext(matches=self.approximate_search(query), query=query, exact_match=False)

    def context_from_classification(self, entities: dict[str, Any], fallback_text: str) -> ProductContext:
        """Construye una consulta usando entidades de clasificacion."""

        query = str(entities.get("sku") or entities.get("producto") or fallback_text)
        return self.get_context(query)

    def _load_products(self) -> pd.DataFrame:
        """Carga productos desde CSV y normaliza columnas clave."""

        try:
            products = pd.read_csv(self.settings.csv_productos)
        except Exception as exc:
            logger.exception("No se pudo cargar productos.csv")
            raise RuntimeError("Base de conocimiento no disponible") from exc
        for column in ["sku", "nombre", "marca", "modelo_impresora", "compatible_con"]:
            products[column] = products[column].fillna("").astype(str)
        return products
