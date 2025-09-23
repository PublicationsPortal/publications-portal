from invenio_i18n import lazy_gettext as _
from invenio_records_resources.services.custom_fields import BaseCF,TextCF
from marshmallow import fields
from marshmallow_utils.fields import SanitizedUnicode


class SummarizationCF(BaseCF):
    """Nested custom field."""
    @property
    def field(self):
        """Meeting fields definitions."""
        return fields.Nested(
            {
                "simple": SanitizedUnicode(),
                "advanced": SanitizedUnicode()
            }
        )

    @property
    def mapping(self):
        """Meeting search mappings."""
        return {
            "type": "object",
            "properties": {
                "simple": {"type": "text"},
                "advanced": {"type": "text"}
            },
        }
        
SUMMARIZATION_NAMESPACE = {
    "summarization": "",
}

SUMMARIZATION_CUSTOM_FIELDS = [
  SummarizationCF(name="summarization:summarization"),
]

SUMMARIZATION_CUSTOM_FIELDS_UI = {
  "section": _("Summarization"),
  "fields": [
    {
        "field": "summarization:summarization",
        "ui_widget": "Summarization",
        "template": "summarization.html",
        "props": {
          "simple": {
            "label": _("Simple Summary"),
            "description": _("A simple summary of the abstract generated using OpenAI."),
            "placeholder": _("Simple summary will be generated here..."),
            "readonly": True,
          },
          "advanced": {
            "label": _("Advanced Summary"),
            "description": _("An advanced summary of the abstract generated using OpenAI."),
            "placeholder": _("Advanced summary will be generated here..."),
            "readonly": True,
          }
        }
    },
  ]
}