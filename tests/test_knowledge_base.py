"""Tests de la base de conocimiento."""

from __future__ import annotations

from config import ensure_runtime_files, get_settings
from modulo1_email.knowledge_base import ProductKnowledgeBase


def test_knowledge_base_finds_products() -> None:
    """La busqueda aproximada debe devolver productos simulados."""

    settings = get_settings()
    ensure_runtime_files(settings)
    kb = ProductKnowledgeBase(settings)
    context = kb.get_context("toner HP")
    assert context.matches
    assert "sku" in context.matches[0]


def test_knowledge_base_exact_search_by_sku() -> None:
    """La busqueda exacta debe localizar un SKU existente."""

    settings = get_settings()
    ensure_runtime_files(settings)
    kb = ProductKnowledgeBase(settings)
    first = kb.approximate_search("toner", limit=1)[0]
    matches = kb.exact_search(first["sku"])
    assert matches[0]["sku"] == first["sku"]
