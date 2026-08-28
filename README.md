# Asistente-Virtual-Inteligente-para-Moodle
TRABAJO FINAL INTEGRADOR
# Asistente Virtual Inteligente para Moodle (Moodle RAG Agent)

**Propuesta de Proyecto Final** — Sistema web conversacional basado en Inteligencia Artificial con arquitectura RAG (Retrieval-Augmented Generation) e integración a la API de Moodle mediante *Function Calling*.

---

## 📋 Descripción del Proyecto

El **Asistente Virtual Inteligente para Moodle** es una plataforma web orientada a estudiantes universitarios que busca resolver la dispersión de información y simplificar el seguimiento académico dentro del campus virtual.

Mediante el uso de un **Agente RAG autónomo**, el sistema procesa lenguaje natural para consultar información en tiempo real desde la API REST de Moodle (entregas pendientes, fechas de exámenes, calificaciones, novedades de materias y recursos de estudio), permitiendo que el usuario interactúe con el campus como si estuviera conversando con un tutor académico personal.

---

## 🏗️ Arquitectura del Sistema

El proyecto está estructurado bajo un patrón de **Monorepo** dividido en tres módulos principales:

```text
moodle-rag-agent/
├── frontend/         # Interfaz de usuario (Chatbot interactivo + Dashboard)
├── backend/          # API Gateway, Autenticación y Persistencia
├── agent/            # Módulo de IA (Agente RAG + Integración con API Moodle)
└── docs/             # Documentación técnica y diagramas de arquitectura
