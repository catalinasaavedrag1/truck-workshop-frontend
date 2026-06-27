// Generated from frontend mocks. Do not edit manually.
// Run `npm --prefix backend run seed:generate` after changing mock data.

export const seedRecordsByResource = {
  "approvals": [
    {
      "id": "approval-001",
      "type": "quote",
      "status": "pending",
      "relatedEntityId": "quote-001",
      "caseId": "case-001",
      "title": "Aprobar cotizacion COT-2026-0012",
      "requestedBy": "Javier Torres",
      "approverRole": "JEFE_TALLER",
      "amount": 223800,
      "createdAt": "2026-05-05T10:35:00.000Z",
      "updatedAt": "2026-05-05T10:35:00.000Z"
    },
    {
      "id": "approval-002",
      "type": "purchase",
      "status": "approved",
      "relatedEntityId": "po-001",
      "caseId": "case-002",
      "title": "Compra valvula moduladora freno",
      "requestedBy": "Felipe Araya",
      "approverRole": "JEFE_TALLER",
      "amount": 630000,
      "createdAt": "2026-05-04T16:25:00.000Z",
      "resolvedAt": "2026-05-04T16:50:00.000Z",
      "updatedAt": "2026-05-04T16:25:00.000Z"
    },
    {
      "id": "approval-003",
      "type": "repair",
      "status": "pending",
      "relatedEntityId": "case-004",
      "caseId": "case-004",
      "title": "Autorizar entrega con recepcion parcial",
      "requestedBy": "Camila Herrera",
      "approverRole": "SUPERVISOR",
      "createdAt": "2026-05-05T09:10:00.000Z",
      "updatedAt": "2026-05-05T09:10:00.000Z"
    }
  ],
  "alert-subscriptions": [
    {
      "id": "alert-sub-supervisor-gps",
      "userId": "user-supervisor-flota",
      "userName": "Supervisor flota",
      "channel": "in_app",
      "sourceModule": "Telemetria / GPS",
      "eventType": "Alerta critica GPS",
      "severity": "critical",
      "deliveryTarget": "Centro de notificaciones",
      "isEnabled": true,
      "quietHoursStart": "22:00",
      "quietHoursEnd": "07:00",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-07T09:00:00.000Z"
    },
    {
      "id": "alert-sub-workshop-sla",
      "userId": "user-jefe-taller",
      "userName": "Jefe taller",
      "channel": "email",
      "sourceModule": "Casos taller",
      "eventType": "SLA en riesgo",
      "severity": "warning",
      "deliveryTarget": "taller@truckworkshop.local",
      "isEnabled": true,
      "quietHoursStart": "21:00",
      "quietHoursEnd": "07:30",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-07T09:00:00.000Z"
    },
    {
      "id": "alert-sub-inventory-low-stock",
      "userId": "user-bodega",
      "userName": "Bodega",
      "channel": "whatsapp",
      "sourceModule": "Gestion inventario",
      "eventType": "Stock bajo minimo",
      "severity": "warning",
      "deliveryTarget": "+56 9 5000 8800",
      "isEnabled": true,
      "quietHoursStart": "20:00",
      "quietHoursEnd": "08:00",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-07T09:00:00.000Z"
    }
  ],
  "communication-conversations": [
    {
      "id": "comm-conv-freight-001",
      "channel": "whatsapp",
      "profileId": "comm-profile-whatsapp-ops",
      "profileName": "WhatsApp Operaciones",
      "contactName": "Valentina Arce",
      "contactAddress": "+56 9 5000 1111",
      "relatedEntityType": "customer",
      "relatedEntityId": "customer-ruta-norte",
      "relatedEntityLabel": "Ruta Norte SpA",
      "subject": "Coordinacion retiro Santiago - Los Andes",
      "status": "open",
      "priority": "high",
      "assignedTo": "Mesa operaciones",
      "lastMessageAt": "2026-05-05T11:42:00.000Z",
      "lastMessagePreview": "Confirmado, chofer sale a retiro en 20 minutos.",
      "unreadCount": 1,
      "tags": [
        "flete",
        "retiro",
        "cliente"
      ],
      "createdBy": "Sistema",
      "updatedBy": "Mesa operaciones",
      "createdAt": "2026-05-05T08:50:00.000Z",
      "updatedAt": "2026-05-05T11:42:00.000Z"
    },
    {
      "id": "comm-conv-case-002",
      "channel": "email",
      "profileId": "comm-profile-email-workshop",
      "profileName": "Correo Taller",
      "contactName": "Javier Torres",
      "contactAddress": "javier@cliente.local",
      "relatedEntityType": "case",
      "relatedEntityId": "case-002",
      "relatedEntityLabel": "TW-2026-002",
      "subject": "Aprobacion reparacion sistema de frenos",
      "status": "pending",
      "priority": "urgent",
      "assignedTo": "Recepcion taller",
      "lastMessageAt": "2026-05-05T10:35:00.000Z",
      "lastMessagePreview": "Se envio cotizacion y queda pendiente aprobacion del cliente.",
      "unreadCount": 0,
      "tags": [
        "taller",
        "cotizacion",
        "aprobacion"
      ],
      "createdBy": "Recepcion",
      "updatedBy": "Recepcion",
      "createdAt": "2026-05-05T09:15:00.000Z",
      "updatedAt": "2026-05-05T10:35:00.000Z"
    },
    {
      "id": "comm-conv-driver-004",
      "channel": "whatsapp",
      "profileId": "comm-profile-whatsapp-ops",
      "profileName": "WhatsApp Operaciones",
      "contactName": "Claudio Munoz",
      "contactAddress": "+56 9 6901 3322",
      "relatedEntityType": "driver",
      "relatedEntityId": "driver-004",
      "relatedEntityLabel": "Chofer Claudio Munoz",
      "subject": "Documento vencido y disponibilidad",
      "status": "open",
      "priority": "medium",
      "assignedTo": "Supervisor flota",
      "lastMessageAt": "2026-05-05T09:10:00.000Z",
      "lastMessagePreview": "Necesito subir renovacion de licencia antes de asignar ruta.",
      "unreadCount": 2,
      "tags": [
        "chofer",
        "documentos",
        "bloqueo"
      ],
      "createdBy": "Supervisor",
      "updatedBy": "Supervisor",
      "createdAt": "2026-05-04T16:15:00.000Z",
      "updatedAt": "2026-05-05T09:10:00.000Z"
    },
    {
      "id": "comm-conv-po-001",
      "channel": "email",
      "profileId": "comm-profile-email-billing",
      "profileName": "Correo Facturacion",
      "contactName": "Repuestos Norte",
      "contactAddress": "ventas@repuestosnorte.local",
      "relatedEntityType": "purchase-order",
      "relatedEntityId": "po-001",
      "relatedEntityLabel": "OC PO-2026-001",
      "subject": "Seguimiento entrega valvula moduladora",
      "status": "resolved",
      "priority": "low",
      "assignedTo": "Compras",
      "lastMessageAt": "2026-05-04T17:25:00.000Z",
      "lastMessagePreview": "Proveedor confirma despacho para manana 09:00.",
      "unreadCount": 0,
      "tags": [
        "compra",
        "proveedor",
        "repuesto"
      ],
      "createdBy": "Compras",
      "updatedBy": "Compras",
      "createdAt": "2026-05-04T15:20:00.000Z",
      "updatedAt": "2026-05-04T17:25:00.000Z"
    }
  ],
  "communication-messages": [
    {
      "id": "comm-msg-001",
      "conversationId": "comm-conv-freight-001",
      "channel": "whatsapp",
      "profileId": "comm-profile-whatsapp-ops",
      "direction": "inbound",
      "status": "read",
      "fromName": "Valentina Arce",
      "fromAddress": "+56 9 5000 1111",
      "toName": "WhatsApp Operaciones",
      "toAddress": "+56 9 5000 7700",
      "body": "Necesitamos confirmar si el camion ya va camino al retiro en Santiago.",
      "sentAt": "2026-05-05T11:18:00.000Z",
      "readAt": "2026-05-05T11:19:00.000Z",
      "attachments": [],
      "createdBy": "Valentina Arce",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "comm-msg-002",
      "conversationId": "comm-conv-freight-001",
      "channel": "whatsapp",
      "profileId": "comm-profile-whatsapp-ops",
      "direction": "outbound",
      "status": "delivered",
      "fromName": "Mesa operaciones",
      "fromAddress": "+56 9 5000 7700",
      "toName": "Valentina Arce",
      "toAddress": "+56 9 5000 1111",
      "body": "Confirmado, chofer sale a retiro en 20 minutos. Te aviso cuando llegue a punto de carga.",
      "sentAt": "2026-05-05T11:42:00.000Z",
      "deliveredAt": "2026-05-05T11:42:30.000Z",
      "attachments": [],
      "createdBy": "Mesa operaciones",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "comm-msg-003",
      "conversationId": "comm-conv-case-002",
      "channel": "email",
      "profileId": "comm-profile-email-workshop",
      "direction": "outbound",
      "status": "sent",
      "fromName": "Recepcion taller",
      "fromAddress": "taller@truckworkshop.local",
      "toName": "Javier Torres",
      "toAddress": "javier@cliente.local",
      "subject": "Aprobacion reparacion sistema de frenos",
      "body": "Adjuntamos detalle de diagnostico y cotizacion para autorizar reparacion del sistema de frenos. Quedamos atentos a aprobacion.",
      "sentAt": "2026-05-05T10:35:00.000Z",
      "attachments": [
        "cotizacion-COT-2026-0012.pdf"
      ],
      "createdBy": "Recepcion",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "comm-msg-004",
      "conversationId": "comm-conv-driver-004",
      "channel": "whatsapp",
      "profileId": "comm-profile-whatsapp-ops",
      "direction": "inbound",
      "status": "delivered",
      "fromName": "Claudio Munoz",
      "fromAddress": "+56 9 6901 3322",
      "toName": "Supervisor flota",
      "toAddress": "+56 9 5000 7700",
      "body": "Estoy regularizando licencia hoy. Envio foto apenas la tenga.",
      "sentAt": "2026-05-05T09:10:00.000Z",
      "attachments": [],
      "createdBy": "Claudio Munoz",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "comm-msg-005",
      "conversationId": "comm-conv-po-001",
      "channel": "email",
      "profileId": "comm-profile-email-billing",
      "direction": "outbound",
      "status": "read",
      "fromName": "Compras",
      "fromAddress": "facturacion@truckworkshop.local",
      "toName": "Repuestos Norte",
      "toAddress": "ventas@repuestosnorte.local",
      "subject": "Seguimiento entrega valvula moduladora",
      "body": "Favor confirmar horario de despacho de la valvula moduladora asociada a la OC PO-2026-001.",
      "sentAt": "2026-05-04T17:10:00.000Z",
      "deliveredAt": "2026-05-04T17:10:12.000Z",
      "readAt": "2026-05-04T17:18:00.000Z",
      "attachments": [
        "PO-2026-001.pdf"
      ],
      "createdBy": "Compras",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "communication-profiles": [
    {
      "id": "comm-profile-whatsapp-ops",
      "name": "WhatsApp Operaciones",
      "channel": "whatsapp",
      "address": "+56 9 5000 7700",
      "ownerName": "Mesa operaciones",
      "department": "Despacho",
      "status": "active",
      "isDefault": true,
      "signature": "Mesa operaciones Truck Workshop",
      "notes": "Canal principal para choferes, clientes y coordinacion de fletes.",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T08:00:00.000Z",
      "updatedAt": "2026-05-05T08:30:00.000Z"
    },
    {
      "id": "comm-profile-email-workshop",
      "name": "Correo Taller",
      "channel": "email",
      "address": "taller@truckworkshop.local",
      "ownerName": "Recepcion taller",
      "department": "Taller",
      "status": "active",
      "isDefault": false,
      "signature": "Recepcion Taller Truck Workshop",
      "notes": "Seguimiento formal de diagnosticos, cotizaciones y aprobaciones.",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T08:00:00.000Z",
      "updatedAt": "2026-05-05T08:30:00.000Z"
    },
    {
      "id": "comm-profile-email-billing",
      "name": "Correo Facturacion",
      "channel": "email",
      "address": "facturacion@truckworkshop.local",
      "ownerName": "Administracion",
      "department": "Administracion",
      "status": "active",
      "isDefault": false,
      "signature": "Administracion Truck Workshop",
      "notes": "Envio de respaldos, facturas y documentos comerciales.",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T08:00:00.000Z",
      "updatedAt": "2026-05-05T08:30:00.000Z"
    }
  ],
  "communication-provider-configs": [
    {
      "id": "comm-provider-whatsapp-meta",
      "name": "Meta WhatsApp Cloud",
      "channel": "whatsapp",
      "provider": "whatsapp_cloud",
      "deliveryMode": "simulation",
      "profileId": "comm-profile-whatsapp-ops",
      "profileName": "WhatsApp Operaciones",
      "isActive": true,
      "fromAddress": "+56 9 5000 7700",
      "whatsappApiVersion": "v25.0",
      "whatsappPhoneNumberId": "",
      "whatsappBusinessAccountId": "",
      "hasWhatsappAccessToken": false,
      "hasWhatsappAppSecret": false,
      "lastTestStatus": "simulation-ready",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T08:00:00.000Z",
      "updatedAt": "2026-05-05T08:30:00.000Z"
    },
    {
      "id": "comm-provider-outlook-graph",
      "name": "Outlook Microsoft Graph",
      "channel": "email",
      "provider": "microsoft_graph",
      "deliveryMode": "simulation",
      "profileId": "comm-profile-email-workshop",
      "profileName": "Correo Taller",
      "isActive": true,
      "fromAddress": "taller@truckworkshop.local",
      "outlookTenantId": "",
      "outlookClientId": "",
      "outlookUserPrincipalName": "",
      "outlookSaveToSentItems": true,
      "hasOutlookClientSecret": false,
      "lastTestStatus": "simulation-ready",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T08:00:00.000Z",
      "updatedAt": "2026-05-05T08:30:00.000Z"
    }
  ],
  "communication-quote-links": [
    {
      "id": "comm-link-case-002-quote-002",
      "conversationId": "comm-conv-case-002",
      "quoteType": "workshop",
      "quoteId": "quote-002",
      "quoteNumber": "COT-2026-0013",
      "customerName": "Transportes Maipo",
      "status": "APPROVED",
      "total": 918000,
      "linkedBy": "Recepcion taller",
      "notes": "Cotizacion enviada y aprobada por correo del cliente.",
      "createdBy": "Recepcion",
      "updatedBy": "Recepcion",
      "createdAt": "2026-05-05T10:36:00.000Z",
      "updatedAt": "2026-05-05T10:36:00.000Z"
    },
    {
      "id": "comm-link-freight-001-fquote-001",
      "conversationId": "comm-conv-freight-001",
      "quoteType": "freight",
      "quoteId": "freight-quote-001",
      "quoteNumber": "FQ-2026-001",
      "customerName": "Ruta Norte SpA",
      "status": "SENT",
      "total": 790160,
      "linkedBy": "Mesa operaciones",
      "notes": "Seguimiento por WhatsApp posterior al envio de la cotizacion de flete.",
      "createdBy": "Mesa operaciones",
      "updatedBy": "Mesa operaciones",
      "createdAt": "2026-05-05T11:43:00.000Z",
      "updatedAt": "2026-05-05T11:43:00.000Z"
    }
  ],
  "customers": [
    {
      "id": "customer-ruta-norte",
      "name": "Ruta Norte SpA",
      "rut": "76.102.331-8",
      "contactName": "Valentina Arce",
      "phone": "+56 9 5000 1111",
      "email": "operaciones@rutanorte.cl",
      "billingAddress": "Av. Americo Vespucio 1200, Santiago",
      "preferredOrigins": [
        "Santiago",
        "Quilicura"
      ],
      "preferredDestinations": [
        "La Serena",
        "Antofagasta"
      ],
      "freightTypes": [
        "PALLETIZED",
        "GENERAL"
      ],
      "priceList": [
        {
          "id": "price-ruta-palletized",
          "cargoType": "PALLETIZED",
          "label": "Paletizada norte",
          "baseRate": 32000,
          "kmRate": 1120,
          "minimumCharge": 180000,
          "discountPercent": 4
        },
        {
          "id": "price-ruta-general",
          "cargoType": "GENERAL",
          "label": "General recurrente",
          "baseRate": 30000,
          "kmRate": 1080,
          "minimumCharge": 140000,
          "discountPercent": 3
        }
      ],
      "creditEnabled": true,
      "creditLimit": 9000000,
      "creditUsed": 2600000,
      "paymentTermsDays": 30,
      "status": "active",
      "riskLevel": "low",
      "notes": "Cliente recurrente con rutas norte y retiro programado.",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    },
    {
      "id": "customer-maipo",
      "name": "Transportes Maipo",
      "rut": "77.200.441-1",
      "contactName": "Claudia Navarro",
      "phone": "+56 9 5111 2222",
      "email": "trafico@maipo.cl",
      "billingAddress": "San Bernardo, Santiago",
      "preferredOrigins": [
        "San Bernardo"
      ],
      "preferredDestinations": [
        "San Antonio",
        "Valparaiso"
      ],
      "freightTypes": [
        "GENERAL",
        "BULK"
      ],
      "priceList": [
        {
          "id": "price-maipo-general",
          "cargoType": "GENERAL",
          "label": "General puerto",
          "baseRate": 28000,
          "kmRate": 1180,
          "minimumCharge": 95000,
          "discountPercent": 2
        }
      ],
      "creditEnabled": true,
      "creditLimit": 4500000,
      "creditUsed": 3300000,
      "paymentTermsDays": 15,
      "status": "active",
      "riskLevel": "medium",
      "notes": "Validar cupo antes de aprobar fletes sobre 1 millon.",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-04T14:20:00.000Z"
    },
    {
      "id": "customer-minerales-sur",
      "name": "Minerales del Sur",
      "rut": "79.883.120-5",
      "contactName": "Rodrigo Lagos",
      "phone": "+56 9 5222 3333",
      "email": "logistica@minerales-sur.cl",
      "billingAddress": "Rancagua",
      "preferredOrigins": [
        "Rancagua"
      ],
      "preferredDestinations": [
        "Concepcion",
        "Talcahuano"
      ],
      "freightTypes": [
        "OVERSIZED",
        "HAZARDOUS"
      ],
      "priceList": [
        {
          "id": "price-minerales-oversized",
          "cargoType": "OVERSIZED",
          "label": "Sobredimensionado minero",
          "baseRate": 68000,
          "kmRate": 1650,
          "minimumCharge": 620000,
          "discountPercent": 0
        }
      ],
      "creditEnabled": false,
      "creditLimit": 0,
      "creditUsed": 0,
      "paymentTermsDays": 0,
      "status": "active",
      "riskLevel": "high",
      "notes": "Operar con anticipo para cargas especiales.",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-05T11:20:00.000Z"
    }
  ],
  "assignments": [
    {
      "assignedAt": "2026-05-05T10:30:00.000Z",
      "caseCode": "TW-2026-001",
      "caseId": "case-001",
      "createdAt": "2026-05-02T09:30:00.000Z",
      "id": "assignment-case-001",
      "mechanicId": "mechanic-001",
      "mechanicName": "Daniel Rivas",
      "status": "active",
      "updatedAt": "2026-05-05T10:30:00.000Z"
    },
    {
      "assignedAt": "2026-05-05T09:20:00.000Z",
      "caseCode": "TW-2026-002",
      "caseId": "case-002",
      "createdAt": "2026-05-03T13:10:00.000Z",
      "id": "assignment-case-002",
      "mechanicId": "mechanic-002",
      "mechanicName": "Paula Fuentes",
      "status": "active",
      "updatedAt": "2026-05-05T09:20:00.000Z"
    },
    {
      "assignedAt": "2026-05-04T16:15:00.000Z",
      "caseCode": "TW-2026-003",
      "caseId": "case-003",
      "createdAt": "2026-05-04T08:45:00.000Z",
      "id": "assignment-case-003",
      "mechanicId": "mechanic-003",
      "mechanicName": "Marco Silva",
      "status": "active",
      "updatedAt": "2026-05-04T16:15:00.000Z"
    },
    {
      "assignedAt": "2026-05-05T08:45:00.000Z",
      "caseCode": "TW-2026-004",
      "caseId": "case-004",
      "createdAt": "2026-04-30T11:15:00.000Z",
      "id": "assignment-case-004",
      "mechanicId": "mechanic-004",
      "mechanicName": "Camila Herrera",
      "status": "active",
      "updatedAt": "2026-05-05T08:45:00.000Z"
    }
  ],
  "diagnostic-checklists": [
    {
      "id": "checklist-engine",
      "category": "engine",
      "name": "Motor",
      "estimatedMinutes": 35,
      "items": [
        {
          "id": "engine-001",
          "label": "Revisar codigos de falla",
          "required": true,
          "checked": true
        },
        {
          "id": "engine-002",
          "label": "Medir presion de combustible",
          "required": true,
          "checked": false
        },
        {
          "id": "engine-003",
          "label": "Inspeccionar filtros y lineas",
          "required": true,
          "checked": true
        }
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "checklist-brakes",
      "category": "brakes",
      "name": "Frenos",
      "estimatedMinutes": 45,
      "items": [
        {
          "id": "brakes-001",
          "label": "Verificar perdida de aire",
          "required": true,
          "checked": true
        },
        {
          "id": "brakes-002",
          "label": "Revisar valvula moduladora",
          "required": true,
          "checked": true
        },
        {
          "id": "brakes-003",
          "label": "Probar presion de circuito",
          "required": true,
          "checked": false
        }
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "checklist-electrical",
      "category": "electrical",
      "name": "Electrico",
      "estimatedMinutes": 30,
      "items": [
        {
          "id": "electrical-001",
          "label": "Revisar bateria y alternador",
          "required": true,
          "checked": false
        },
        {
          "id": "electrical-002",
          "label": "Inspeccionar arnes principal",
          "required": false,
          "checked": false
        },
        {
          "id": "electrical-003",
          "label": "Validar sensores reportados",
          "required": true,
          "checked": false
        }
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "checklist-tires",
      "category": "tires",
      "name": "Neumaticos",
      "estimatedMinutes": 20,
      "items": [
        {
          "id": "tires-001",
          "label": "Medir profundidad",
          "required": true,
          "checked": false
        },
        {
          "id": "tires-002",
          "label": "Revisar presion",
          "required": true,
          "checked": true
        },
        {
          "id": "tires-003",
          "label": "Buscar cortes o deformaciones",
          "required": true,
          "checked": false
        }
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "checklist-suspension",
      "category": "suspension",
      "name": "Suspension",
      "estimatedMinutes": 40,
      "items": [
        {
          "id": "suspension-001",
          "label": "Inspeccionar bujes",
          "required": true,
          "checked": true
        },
        {
          "id": "suspension-002",
          "label": "Revisar amortiguadores",
          "required": true,
          "checked": false
        },
        {
          "id": "suspension-003",
          "label": "Validar alineacion visual",
          "required": false,
          "checked": false
        }
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "checklist-transmission",
      "category": "transmission",
      "name": "Transmision",
      "estimatedMinutes": 50,
      "items": [
        {
          "id": "transmission-001",
          "label": "Verificar embrague",
          "required": true,
          "checked": true
        },
        {
          "id": "transmission-002",
          "label": "Revisar fugas",
          "required": true,
          "checked": false
        },
        {
          "id": "transmission-003",
          "label": "Probar cambios en ruta corta",
          "required": true,
          "checked": false
        }
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "diagnostics": [
    {
      "caseId": "case-001",
      "category": "engine",
      "createdAt": "2026-05-02T09:30:00.000Z",
      "id": "diagnostic-case-001",
      "rootCause": "Perdida de potencia en subida y consumo irregular.",
      "severity": "high",
      "symptoms": [
        "Perdida de potencia en subida",
        "Perdida de potencia en subida y consumo irregular."
      ]
    },
    {
      "caseId": "case-002",
      "category": "brakes",
      "createdAt": "2026-05-03T13:10:00.000Z",
      "id": "diagnostic-case-002",
      "rootCause": "Fuga de aire en sistema de frenos con perdida rapida de presion.",
      "severity": "critical",
      "symptoms": [
        "Fuga de aire en sistema de frenos",
        "Fuga de aire en sistema de frenos con perdida rapida de presion."
      ]
    },
    {
      "caseId": "case-003",
      "category": "engine",
      "createdAt": "2026-05-04T08:45:00.000Z",
      "id": "diagnostic-case-003",
      "rootCause": "Revision por vibracion de tren delantero a velocidad media.",
      "severity": "medium",
      "symptoms": [
        "Revision por vibracion de tren delantero",
        "Revision por vibracion de tren delantero a velocidad media."
      ]
    },
    {
      "caseId": "case-004",
      "category": "engine",
      "createdAt": "2026-04-30T11:15:00.000Z",
      "id": "diagnostic-case-004",
      "rootCause": "Prueba final posterior a cambio de embrague con kit pendiente de recepcion.",
      "severity": "medium",
      "symptoms": [
        "Prueba final posterior a cambio de embrague",
        "Prueba final posterior a cambio de embrague con kit pendiente de recepcion."
      ]
    }
  ],
  "driver-documents": [
    {
      "id": "driver-doc-001",
      "driverId": "driver-001",
      "documentType": "LICENSE",
      "documentNumber": "A5-123456",
      "issuedAt": "2024-04-10T00:00:00.000Z",
      "expiresAt": "2027-04-10T00:00:00.000Z",
      "status": "VALID",
      "attachmentUrl": "/mock/licencia-luis.pdf",
      "notes": "Licencia profesional A5 vigente.",
      "createdAt": "2026-04-18T10:00:00.000Z",
      "updatedAt": "2026-04-18T10:00:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "RRHH"
    },
    {
      "id": "driver-doc-002",
      "driverId": "driver-001",
      "documentType": "MEDICAL_CERTIFICATE",
      "documentNumber": "MED-8821",
      "issuedAt": "2025-05-20T00:00:00.000Z",
      "expiresAt": "2026-06-20T00:00:00.000Z",
      "status": "EXPIRES_SOON",
      "attachmentUrl": "/mock/medico-luis.pdf",
      "notes": "Renovar antes de programar rutas largas.",
      "createdAt": "2026-04-18T10:00:00.000Z",
      "updatedAt": "2026-05-02T09:00:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "Operacion"
    },
    {
      "id": "driver-doc-003",
      "driverId": "driver-002",
      "documentType": "LICENSE",
      "documentNumber": "A5-883420",
      "issuedAt": "2023-11-02T00:00:00.000Z",
      "expiresAt": "2026-05-01T00:00:00.000Z",
      "status": "EXPIRED",
      "attachmentUrl": "/mock/licencia-marcela.pdf",
      "notes": "No asignar hasta renovar licencia.",
      "createdAt": "2026-04-21T15:20:00.000Z",
      "updatedAt": "2026-05-01T09:10:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "Supervisor"
    },
    {
      "id": "driver-doc-004",
      "driverId": "driver-002",
      "documentType": "PSYCHOTECHNICAL",
      "documentNumber": "PSI-2026-091",
      "issuedAt": "2026-01-04T00:00:00.000Z",
      "expiresAt": "2027-01-04T00:00:00.000Z",
      "status": "VALID",
      "attachmentUrl": "/mock/psico-marcela.pdf",
      "createdAt": "2026-04-21T15:20:00.000Z",
      "updatedAt": "2026-04-21T15:20:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "RRHH"
    },
    {
      "id": "driver-doc-005",
      "driverId": "driver-003",
      "documentType": "LICENSE",
      "documentNumber": "A5-550211",
      "issuedAt": "2025-03-15T00:00:00.000Z",
      "expiresAt": "2028-03-15T00:00:00.000Z",
      "status": "VALID",
      "attachmentUrl": "/mock/licencia-rodrigo.pdf",
      "createdAt": "2026-04-25T09:15:00.000Z",
      "updatedAt": "2026-04-25T09:15:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "RRHH"
    },
    {
      "id": "driver-doc-006",
      "driverId": "driver-003",
      "documentType": "TRAINING",
      "documentNumber": "CAP-MIN-44",
      "issuedAt": "2026-02-10T00:00:00.000Z",
      "expiresAt": "2026-12-10T00:00:00.000Z",
      "status": "VALID",
      "attachmentUrl": "/mock/capacitacion-rodrigo.pdf",
      "notes": "Apto para carga minera.",
      "createdAt": "2026-04-25T09:15:00.000Z",
      "updatedAt": "2026-04-25T09:15:00.000Z",
      "createdBy": "Prevencion",
      "updatedBy": "Prevencion"
    },
    {
      "id": "driver-doc-007",
      "driverId": "driver-004",
      "documentType": "LICENSE",
      "documentNumber": "A4-440101",
      "issuedAt": "2023-01-10T00:00:00.000Z",
      "expiresAt": "2026-01-10T00:00:00.000Z",
      "status": "EXPIRED",
      "attachmentUrl": "/mock/licencia-claudio.pdf",
      "notes": "Chofer inactivo por documento vencido.",
      "createdAt": "2026-03-30T11:40:00.000Z",
      "updatedAt": "2026-05-01T08:00:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "Supervisor"
    },
    {
      "id": "driver-doc-008",
      "driverId": "driver-004",
      "documentType": "MEDICAL_CERTIFICATE",
      "status": "MISSING",
      "notes": "Pendiente cargar certificado medico.",
      "createdAt": "2026-03-30T11:40:00.000Z",
      "updatedAt": "2026-05-01T08:00:00.000Z",
      "createdBy": "RRHH",
      "updatedBy": "Supervisor"
    }
  ],
  "driver-fines": [
    {
      "id": "driver-fine-001",
      "fineNumber": "MUL-2026-001",
      "driverId": "driver-002",
      "truckId": "truck-002",
      "incidentId": "incident-002",
      "fineType": "Documentacion vencida",
      "severity": "HIGH",
      "status": "UNDER_REVIEW",
      "occurredAt": "2026-05-01T12:00:00.000Z",
      "location": "Control carretero Angostura",
      "amount": 145000,
      "dueAt": "2026-05-16T00:00:00.000Z",
      "description": "Multa por circular con documentacion vencida asociada al control carretero.",
      "documentUrl": "/mock/multa-002.pdf",
      "createdAt": "2026-05-01T12:20:00.000Z",
      "updatedAt": "2026-05-02T09:00:00.000Z",
      "createdBy": "Operacion",
      "updatedBy": "Supervisor"
    },
    {
      "id": "driver-fine-002",
      "fineNumber": "MUL-2026-002",
      "driverId": "driver-004",
      "truckId": "truck-004",
      "incidentId": "incident-003",
      "freightId": "freight-request-004",
      "fineType": "Retraso operativo",
      "severity": "LOW",
      "status": "PAID",
      "occurredAt": "2026-05-04T11:40:00.000Z",
      "location": "Los Andes",
      "amount": 80000,
      "dueAt": "2026-05-10T00:00:00.000Z",
      "paidAt": "2026-05-05T10:30:00.000Z",
      "description": "Cobro asociado a espera en planta cliente, cerrado por operaciones.",
      "createdAt": "2026-05-04T12:00:00.000Z",
      "updatedAt": "2026-05-05T10:30:00.000Z",
      "createdBy": "Operacion",
      "updatedBy": "Caja"
    }
  ],
  "driver-trip-sheets": [
    {
      "id": "driver-trip-sheet-001",
      "sheetNumber": "PLAN-2026-001",
      "freightId": "freight-request-004",
      "requestId": "freight-request-004",
      "quoteId": "freight-quote-003",
      "assignmentId": "freight-assignment-001",
      "driverId": "driver-001",
      "driverName": "Luis Herrera",
      "truckId": "truck-005",
      "truckPlate": "BD-FR-80",
      "customerName": "Logistica Cordillera",
      "originAddress": "Quilicura, Santiago",
      "destinationAddress": "Los Andes",
      "tripDate": "2026-05-06T08:00:00.000Z",
      "deliveredAt": "2026-05-06T14:15:00.000Z",
      "kmPlanned": 92,
      "kmReal": 98,
      "revenue": 326000,
      "fuelCost": 68000,
      "tollCost": 18500,
      "mealCost": 9500,
      "tipCost": 5000,
      "parkingCost": 3000,
      "lodgingCost": 0,
      "otherCost": 4200,
      "waitingHours": 1.5,
      "waitingCost": 18000,
      "totalExpenses": 126200,
      "grossMargin": 199800,
      "netMargin": 199800,
      "costPerKm": 1287.76,
      "revenuePerKm": 3326.53,
      "performanceScore": 91,
      "status": "APPROVED",
      "expenseItems": [
        {
          "id": "expense-001-toll",
          "amount": 18500,
          "category": "TOLL",
          "label": "Peajes ruta Los Andes"
        },
        {
          "id": "expense-001-meal",
          "amount": 9500,
          "category": "MEAL",
          "label": "Colacion chofer"
        },
        {
          "id": "expense-001-tip",
          "amount": 5000,
          "category": "TIP",
          "label": "Propina descarga"
        },
        {
          "id": "expense-001-parking",
          "amount": 3000,
          "category": "PARKING",
          "label": "Estacionamiento destino"
        },
        {
          "id": "expense-001-waiting",
          "amount": 18000,
          "category": "WAITING",
          "label": "1.5 h espera descarga"
        }
      ],
      "notes": "Rendimiento correcto, espera menor a lo pactado.",
      "createdBy": "Andrea Molina",
      "updatedBy": "Andrea Molina",
      "createdAt": "2026-05-06T15:00:00.000Z",
      "updatedAt": "2026-05-06T16:10:00.000Z"
    },
    {
      "id": "driver-trip-sheet-002",
      "sheetNumber": "PLAN-2026-002",
      "freightId": "freight-request-002",
      "requestId": "freight-request-002",
      "quoteId": "freight-quote-002",
      "assignmentId": "freight-assignment-002",
      "driverId": "driver-002",
      "driverName": "Marcela Soto",
      "truckId": "truck-005",
      "truckPlate": "BD-FR-80",
      "customerId": "customer-maipo",
      "customerName": "Transportes Maipo",
      "originAddress": "San Bernardo, Santiago",
      "destinationAddress": "Puerto San Antonio",
      "tripDate": "2026-05-07T14:00:00.000Z",
      "deliveredAt": "2026-05-07T18:35:00.000Z",
      "kmPlanned": 118,
      "kmReal": 120,
      "revenue": 185000,
      "fuelCost": 47000,
      "tollCost": 12000,
      "mealCost": 7000,
      "tipCost": 0,
      "parkingCost": 2500,
      "lodgingCost": 0,
      "otherCost": 1000,
      "waitingHours": 0,
      "waitingCost": 0,
      "totalExpenses": 69500,
      "grossMargin": 115500,
      "netMargin": 115500,
      "costPerKm": 579.17,
      "revenuePerKm": 1541.67,
      "performanceScore": 88,
      "status": "SUBMITTED",
      "expenseItems": [
        {
          "id": "expense-002-toll",
          "amount": 12000,
          "category": "TOLL",
          "label": "Peajes puerto"
        },
        {
          "id": "expense-002-meal",
          "amount": 7000,
          "category": "MEAL",
          "label": "Colacion ruta"
        },
        {
          "id": "expense-002-parking",
          "amount": 2500,
          "category": "PARKING",
          "label": "Acceso terminal"
        }
      ],
      "notes": "Pendiente revision administrativa de comprobantes.",
      "createdBy": "Marcela Soto",
      "updatedBy": "Marcela Soto",
      "createdAt": "2026-05-07T19:00:00.000Z",
      "updatedAt": "2026-05-07T19:00:00.000Z"
    },
    {
      "id": "driver-trip-sheet-003",
      "sheetNumber": "PLAN-2026-003",
      "freightId": "freight-request-001",
      "requestId": "freight-request-001",
      "quoteId": "freight-quote-001",
      "driverId": "driver-003",
      "driverName": "Rodrigo Pavez",
      "truckId": "truck-001",
      "truckPlate": "HH-RR-24",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "originAddress": "Av. Americo Vespucio 1200, Santiago",
      "destinationAddress": "Ruta 5 Norte Km 470, La Serena",
      "tripDate": "2026-05-08T12:00:00.000Z",
      "kmPlanned": 470,
      "kmReal": 486,
      "revenue": 680000,
      "fuelCost": 310000,
      "tollCost": 66000,
      "mealCost": 24000,
      "tipCost": 10000,
      "parkingCost": 8000,
      "lodgingCost": 38000,
      "otherCost": 12000,
      "waitingHours": 3,
      "waitingCost": 45000,
      "totalExpenses": 513000,
      "grossMargin": 167000,
      "netMargin": 167000,
      "costPerKm": 1055.56,
      "revenuePerKm": 1399.18,
      "performanceScore": 71,
      "status": "DRAFT",
      "expenseItems": [
        {
          "id": "expense-003-fuel",
          "amount": 310000,
          "category": "FUEL",
          "label": "Combustible estimado norte"
        },
        {
          "id": "expense-003-toll",
          "amount": 66000,
          "category": "TOLL",
          "label": "Peajes Ruta 5 Norte"
        },
        {
          "id": "expense-003-lodging",
          "amount": 38000,
          "category": "LODGING",
          "label": "Alojamiento por retorno"
        },
        {
          "id": "expense-003-waiting",
          "amount": 45000,
          "category": "WAITING",
          "label": "3 h espera carga"
        }
      ],
      "notes": "Revisar margen antes de cierre por espera y retorno.",
      "createdBy": "Rodrigo Pavez",
      "updatedBy": "Rodrigo Pavez",
      "createdAt": "2026-05-08T11:30:00.000Z",
      "updatedAt": "2026-05-08T11:30:00.000Z"
    }
  ],
  "drivers": [
    {
      "id": "driver-001",
      "name": "Luis Herrera",
      "document": "12.345.678-5",
      "phone": "+56 9 6123 4567",
      "company": "Ruta Norte SpA",
      "license": "A5 vigente",
      "status": "active",
      "caseIds": [
        "case-001"
      ],
      "createdAt": "2026-04-18T10:00:00.000Z",
      "updatedAt": "2026-04-18T10:00:00.000Z"
    },
    {
      "id": "driver-002",
      "name": "Marcela Soto",
      "document": "14.222.391-0",
      "phone": "+56 9 7344 1100",
      "company": "Transportes Maipo",
      "license": "A5 vigente",
      "status": "active",
      "caseIds": [
        "case-002"
      ],
      "createdAt": "2026-04-21T15:20:00.000Z",
      "updatedAt": "2026-04-21T15:20:00.000Z"
    },
    {
      "id": "driver-003",
      "name": "Rodrigo Pavez",
      "document": "16.901.112-7",
      "phone": "+56 9 8112 7744",
      "company": "Minerales del Sur",
      "license": "A5 vigente",
      "status": "active",
      "caseIds": [
        "case-003"
      ],
      "createdAt": "2026-04-25T09:15:00.000Z",
      "updatedAt": "2026-04-25T09:15:00.000Z"
    },
    {
      "id": "driver-004",
      "name": "Claudio Munoz",
      "document": "10.554.901-2",
      "phone": "+56 9 6901 4455",
      "company": "Logistica Cordillera",
      "license": "A4 vencimiento 2026",
      "status": "inactive",
      "caseIds": [
        "case-004"
      ],
      "createdAt": "2026-03-30T11:40:00.000Z",
      "updatedAt": "2026-03-30T11:40:00.000Z"
    }
  ],
  "escalation-events": [
    {
      "id": "esc-001",
      "caseId": "case-002",
      "fromLevel": "LEVEL_0_NORMAL",
      "toLevel": "LEVEL_1_SUPERVISOR",
      "reason": "SLA_AT_RISK",
      "comment": "Caso critico con SLA en riesgo por falta de repuesto de frenos.",
      "createdAt": "2026-05-04T17:05:00.000Z",
      "createdBy": "Javier Torres",
      "updatedAt": "2026-05-04T17:05:00.000Z"
    },
    {
      "id": "esc-002",
      "caseId": "case-002",
      "fromLevel": "LEVEL_1_SUPERVISOR",
      "toLevel": "LEVEL_2_JEFE_TALLER",
      "reason": "CRITICAL_PART_MISSING",
      "comment": "Se solicito priorizar compra y confirmar ETA con proveedor.",
      "createdAt": "2026-05-05T09:20:00.000Z",
      "createdBy": "Javier Torres",
      "updatedAt": "2026-05-05T09:20:00.000Z"
    },
    {
      "id": "esc-003",
      "caseId": "case-004",
      "fromLevel": "LEVEL_0_NORMAL",
      "toLevel": "LEVEL_1_SUPERVISOR",
      "reason": "CUSTOMER_COMPLAINT",
      "comment": "Operaciones solicita hora exacta de liberacion posterior a recepcion del kit.",
      "createdAt": "2026-05-05T08:45:00.000Z",
      "createdBy": "Andrea Molina",
      "updatedAt": "2026-05-05T08:45:00.000Z"
    }
  ],
  "fleet-availability": [
    {
      "id": "availability-001",
      "truckId": "truck-005",
      "column": "AVAILABLE",
      "availableAt": "2026-05-05T10:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "availability-002",
      "truckId": "truck-004",
      "column": "ON_ROUTE",
      "blockerReason": "En ruta hasta Los Andes",
      "availableAt": "2026-05-06T18:30:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "availability-003",
      "truckId": "truck-003",
      "column": "IN_WORKSHOP",
      "blockerReason": "Diagnostico electrico",
      "availableAt": "2026-05-07T18:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "availability-004",
      "truckId": "truck-001",
      "column": "WAITING_PARTS",
      "blockerReason": "Sensor NOx sin stock",
      "availableAt": "2026-05-08T16:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "availability-005",
      "truckId": "truck-002",
      "column": "EXPIRED_DOCUMENTS",
      "blockerReason": "Revision tecnica vencida",
      "availableAt": "2026-05-12T12:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "fleet-trucks": [
    {
      "id": "truck-001",
      "plate": "HH-RR-24",
      "brand": "Volvo",
      "model": "FH 540",
      "year": 2021,
      "vin": "YV2RT60A0MB912345",
      "chassisNumber": "CH-HHRR24-2021",
      "engineNumber": "ENG-VOL-540-912345",
      "loadCapacityKg": 28000,
      "bodyType": "Tracto 6x4",
      "currentOdometer": 284100,
      "operationalStatus": "WAITING_PARTS",
      "fuelType": "DIESEL",
      "acquisitionDate": "2021-07-10T10:00:00.000Z",
      "acquisitionCost": 94000000,
      "ownerType": "OWNED",
      "assignedDriverId": "driver-001",
      "assignedDriverName": "Luis Herrera",
      "estimatedAvailableAt": "2026-05-08T16:00:00.000Z",
      "mainBlocker": "Caso en taller bloqueado por repuesto critico",
      "notes": "Unidad de alto tonelaje para rutas norte.",
      "createdAt": "2021-07-10T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    },
    {
      "id": "truck-002",
      "plate": "KL-DF-91",
      "brand": "Scania",
      "model": "R 450",
      "year": 2020,
      "vin": "YS2R4X200L2176543",
      "chassisNumber": "CH-KLDF91-2020",
      "engineNumber": "ENG-SCA-450-76543",
      "loadCapacityKg": 26000,
      "bodyType": "Tracto 6x2",
      "currentOdometer": 319440,
      "operationalStatus": "BLOCKED",
      "fuelType": "DIESEL",
      "acquisitionDate": "2020-03-16T10:00:00.000Z",
      "acquisitionCost": 82000000,
      "ownerType": "LEASED",
      "assignedDriverId": "driver-002",
      "assignedDriverName": "Marcela Soto",
      "estimatedAvailableAt": "2026-05-12T12:00:00.000Z",
      "mainBlocker": "Revision tecnica vencida e incidente critico abierto",
      "notes": "Bloqueo operacional hasta regularizar documento e incidente.",
      "createdAt": "2020-03-16T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    },
    {
      "id": "truck-003",
      "plate": "PR-JK-65",
      "brand": "Mercedes-Benz",
      "model": "Actros 2645",
      "year": 2022,
      "vin": "WDB96340310234567",
      "chassisNumber": "CH-PRJK65-2022",
      "engineNumber": "ENG-MBZ-2645-34567",
      "loadCapacityKg": 27000,
      "bodyType": "Tolva",
      "currentOdometer": 188900,
      "operationalStatus": "IN_WORKSHOP",
      "fuelType": "DIESEL",
      "acquisitionDate": "2022-01-20T10:00:00.000Z",
      "acquisitionCost": 89000000,
      "ownerType": "OWNED",
      "assignedDriverId": "driver-003",
      "assignedDriverName": "Rodrigo Pavez",
      "estimatedAvailableAt": "2026-05-07T18:00:00.000Z",
      "mainBlocker": "Diagnostico electrico en curso",
      "createdAt": "2022-01-20T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    },
    {
      "id": "truck-004",
      "plate": "VX-TT-11",
      "brand": "MAN",
      "model": "TGX 26.480",
      "year": 2019,
      "vin": "WMA06XZZ8KP123456",
      "chassisNumber": "CH-VXTT11-2019",
      "engineNumber": "ENG-MAN-480-23456",
      "loadCapacityKg": 25500,
      "bodyType": "Plataforma",
      "currentOdometer": 401230,
      "operationalStatus": "ON_ROUTE",
      "fuelType": "DIESEL",
      "acquisitionDate": "2019-10-03T10:00:00.000Z",
      "acquisitionCost": 71000000,
      "ownerType": "OWNED",
      "assignedDriverId": "driver-004",
      "assignedDriverName": "Claudio Munoz",
      "nextFreightId": "freight-request-001",
      "nextFreightAt": "2026-05-05T15:00:00.000Z",
      "estimatedAvailableAt": "2026-05-06T18:30:00.000Z",
      "mainBlocker": "En ruta hacia cliente",
      "createdAt": "2019-10-03T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    },
    {
      "id": "truck-005",
      "plate": "BD-FR-80",
      "brand": "Volvo",
      "model": "FM 460 Refrigerado",
      "year": 2023,
      "vin": "YV2XTY0A0PB778899",
      "chassisNumber": "CH-BDFR80-2023",
      "engineNumber": "ENG-VOL-460-78899",
      "loadCapacityKg": 23000,
      "bodyType": "Refrigerado",
      "currentOdometer": 94120,
      "operationalStatus": "AVAILABLE",
      "fuelType": "DIESEL",
      "acquisitionDate": "2023-05-22T10:00:00.000Z",
      "acquisitionCost": 99000000,
      "ownerType": "LEASED",
      "assignedDriverId": "driver-001",
      "assignedDriverName": "Luis Herrera",
      "nextFreightId": "freight-request-004",
      "nextFreightAt": "2026-05-06T08:00:00.000Z",
      "notes": "Unidad refrigerada lista para despacho.",
      "createdAt": "2023-05-22T10:00:00.000Z",
      "updatedAt": "2026-05-05T10:00:00.000Z"
    }
  ],
  "freight-assignments": [
    {
      "id": "freight-assignment-001",
      "requestId": "freight-request-004",
      "quoteId": "freight-quote-003",
      "truckId": "truck-005",
      "driverId": "driver-001",
      "assignedBy": "Andrea Molina",
      "pickupDate": "2026-05-06T08:00:00.000Z",
      "deliveryDate": "2026-05-06T14:00:00.000Z",
      "status": "SCHEDULED",
      "notes": "Camion refrigerado disponible, revisar temperatura antes de salida.",
      "createdAt": "2026-05-05T09:30:00.000Z",
      "updatedAt": "2026-05-05T09:30:00.000Z"
    }
  ],
  "freight-profitability": [
    {
      "id": "profit-001",
      "freightId": "freight-request-001",
      "truckId": "truck-004",
      "driverId": "driver-004",
      "customerName": "Ruta Norte SpA",
      "revenue": 739500,
      "fuelCost": 244200,
      "tollCost": 68000,
      "driverCost": 90000,
      "tireWearCost": 42000,
      "maintenanceAllocatedCost": 65000,
      "otherCosts": 25000,
      "totalCost": 534200,
      "grossMargin": 205300,
      "netMargin": 188300,
      "marginPercentage": 27.8,
      "km": 470,
      "costPerKm": 1136.6,
      "revenuePerKm": 1573.4,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "profit-002",
      "freightId": "freight-request-002",
      "truckId": "truck-005",
      "driverId": "driver-001",
      "customerName": "Transportes Maipo",
      "revenue": 239666,
      "fuelCost": 68000,
      "tollCost": 22000,
      "driverCost": 43000,
      "tireWearCost": 12000,
      "maintenanceAllocatedCost": 18000,
      "otherCosts": 8000,
      "totalCost": 171000,
      "grossMargin": 68666,
      "netMargin": 62166,
      "marginPercentage": 28.7,
      "km": 118,
      "costPerKm": 1449.2,
      "revenuePerKm": 2031.1,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "profit-003",
      "freightId": "freight-request-004",
      "truckId": "truck-005",
      "driverId": "driver-001",
      "customerName": "Logistica Cordillera",
      "revenue": 220626,
      "fuelCost": 77200,
      "tollCost": 18000,
      "driverCost": 36000,
      "tireWearCost": 9000,
      "maintenanceAllocatedCost": 14000,
      "otherCosts": 6000,
      "totalCost": 160200,
      "grossMargin": 60426,
      "netMargin": 55426,
      "marginPercentage": 27.4,
      "km": 92,
      "costPerKm": 1741.3,
      "revenuePerKm": 2398.1,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "freight-quotes": [
    {
      "id": "freight-quote-001",
      "quoteNumber": "FQ-2026-001",
      "requestId": "freight-request-001",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "estimatedKm": 470,
      "cargoType": "PALLETIZED",
      "baseRate": 35000,
      "kmRate": 1200,
      "waitingCost": 30000,
      "loadingCost": 25000,
      "unloadingCost": 0,
      "cargoTypeSurcharge": 10000,
      "subtotal": 664000,
      "taxAmount": 126160,
      "total": 790160,
      "validUntil": "2026-05-09T18:00:00.000Z",
      "status": "SENT",
      "sentBy": "WHATSAPP",
      "sentAt": "2026-05-05T10:40:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "freight-quote-002",
      "quoteNumber": "FQ-2026-002",
      "requestId": "freight-request-002",
      "customerId": "customer-maipo",
      "customerName": "Transportes Maipo",
      "estimatedKm": 118,
      "cargoType": "GENERAL",
      "baseRate": 35000,
      "kmRate": 1200,
      "waitingCost": 0,
      "loadingCost": 0,
      "unloadingCost": 25000,
      "cargoTypeSurcharge": 0,
      "subtotal": 201600,
      "taxAmount": 38304,
      "total": 239904,
      "validUntil": "2026-05-07T18:00:00.000Z",
      "status": "APPROVED",
      "sentBy": "EMAIL",
      "sentAt": "2026-05-04T15:00:00.000Z",
      "approvedAt": "2026-05-05T08:15:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "freight-quote-003",
      "quoteNumber": "FQ-2026-003",
      "requestId": "freight-request-004",
      "customerName": "Logistica Cordillera",
      "estimatedKm": 92,
      "cargoType": "REFRIGERATED",
      "baseRate": 35000,
      "kmRate": 1200,
      "waitingCost": 0,
      "loadingCost": 0,
      "unloadingCost": 0,
      "cargoTypeSurcharge": 40000,
      "subtotal": 185400,
      "taxAmount": 35226,
      "total": 220626,
      "validUntil": "2026-05-06T18:00:00.000Z",
      "status": "APPROVED",
      "sentBy": "EMAIL",
      "sentAt": "2026-05-03T18:10:00.000Z",
      "approvedAt": "2026-05-04T09:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "freight-requests": [
    {
      "id": "freight-request-001",
      "requestNumber": "FLE-2026-001",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "customerPhone": "+56 9 5000 1111",
      "customerEmail": "operaciones@rutanorte.cl",
      "originAddress": "Av. Americo Vespucio 1200, Santiago",
      "destinationAddress": "Ruta 5 Norte Km 470, La Serena",
      "estimatedKm": 470,
      "cargoType": "PALLETIZED",
      "cargoDescription": "12 pallets de repuestos industriales",
      "weightKg": 6200,
      "volumeM3": 34,
      "requiresWaitingTime": true,
      "waitingHours": 2,
      "requiresLoadingHelp": true,
      "requiresUnloadingHelp": false,
      "requestedPickupDate": "2026-05-08T12:00:00.000Z",
      "observations": "Cliente pide retiro antes de mediodia.",
      "status": "QUOTE_SENT",
      "quoteId": "freight-quote-001",
      "createdAt": "2026-05-05T09:00:00.000Z",
      "updatedAt": "2026-05-05T10:40:00.000Z"
    },
    {
      "id": "freight-request-002",
      "requestNumber": "FLE-2026-002",
      "customerId": "customer-maipo",
      "customerName": "Transportes Maipo",
      "customerPhone": "+56 9 5111 2222",
      "customerEmail": "trafico@maipo.cl",
      "originAddress": "San Bernardo, Santiago",
      "destinationAddress": "Puerto San Antonio",
      "estimatedKm": 118,
      "cargoType": "GENERAL",
      "cargoDescription": "Carga general en bins plasticos",
      "weightKg": 2800,
      "volumeM3": 18,
      "requiresWaitingTime": false,
      "requiresLoadingHelp": false,
      "requiresUnloadingHelp": true,
      "requestedPickupDate": "2026-05-07T14:00:00.000Z",
      "status": "APPROVED",
      "quoteId": "freight-quote-002",
      "createdAt": "2026-05-04T14:20:00.000Z",
      "updatedAt": "2026-05-05T08:15:00.000Z"
    },
    {
      "id": "freight-request-003",
      "requestNumber": "FLE-2026-003",
      "customerId": "customer-minerales-sur",
      "customerName": "Minerales del Sur",
      "customerPhone": "+56 9 5222 3333",
      "originAddress": "Rancagua",
      "destinationAddress": "Concepcion",
      "estimatedKm": 430,
      "cargoType": "OVERSIZED",
      "cargoDescription": "Equipo minero sobredimensionado",
      "weightKg": 9100,
      "volumeM3": 48,
      "requiresWaitingTime": true,
      "waitingHours": 4,
      "requiresLoadingHelp": true,
      "requiresUnloadingHelp": true,
      "requestedPickupDate": "2026-05-10T09:00:00.000Z",
      "status": "QUOTING",
      "createdAt": "2026-05-05T11:20:00.000Z",
      "updatedAt": "2026-05-05T11:20:00.000Z"
    },
    {
      "id": "freight-request-004",
      "requestNumber": "FLE-2026-004",
      "customerName": "Logistica Cordillera",
      "customerEmail": "programacion@cordillera.cl",
      "originAddress": "Quilicura, Santiago",
      "destinationAddress": "Los Andes",
      "estimatedKm": 92,
      "cargoType": "REFRIGERATED",
      "cargoDescription": "Insumos refrigerados",
      "weightKg": 1800,
      "volumeM3": 11,
      "requiresWaitingTime": false,
      "requiresLoadingHelp": false,
      "requiresUnloadingHelp": false,
      "requestedPickupDate": "2026-05-06T08:00:00.000Z",
      "status": "ASSIGNED",
      "quoteId": "freight-quote-003",
      "assignedTruckId": "truck-005",
      "assignedDriverId": "driver-001",
      "createdAt": "2026-05-03T17:00:00.000Z",
      "updatedAt": "2026-05-05T09:30:00.000Z"
    }
  ],
  "fuel-records": [
    {
      "id": "fuel-001",
      "truckId": "truck-005",
      "driverId": "driver-001",
      "date": "2026-05-04T08:00:00.000Z",
      "liters": 180,
      "pricePerLiter": 1090,
      "totalAmount": 196200,
      "odometer": 94120,
      "stationName": "Copec Quilicura",
      "receiptNumber": "B-77891",
      "kmPerLiter": 3.9,
      "deviationStatus": "NORMAL",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "fuel-002",
      "truckId": "truck-004",
      "driverId": "driver-004",
      "date": "2026-05-03T17:00:00.000Z",
      "liters": 220,
      "pricePerLiter": 1110,
      "totalAmount": 244200,
      "odometer": 401230,
      "stationName": "Shell Los Andes",
      "receiptNumber": "S-99210",
      "kmPerLiter": 2.6,
      "deviationStatus": "WARNING",
      "notes": "Rendimiento bajo respecto a promedio historico.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "fuel-003",
      "truckId": "truck-002",
      "driverId": "driver-002",
      "date": "2026-05-02T10:00:00.000Z",
      "liters": 260,
      "pricePerLiter": 1105,
      "totalAmount": 287300,
      "odometer": 319440,
      "stationName": "Petrobras Rancagua",
      "receiptNumber": "P-11231",
      "kmPerLiter": 1.9,
      "deviationStatus": "SUSPICIOUS",
      "notes": "Caida mayor a 35% contra promedio del camion.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "fuel-004",
      "truckId": "truck-001",
      "driverId": "driver-001",
      "date": "2026-04-30T12:30:00.000Z",
      "liters": 210,
      "pricePerLiter": 1088,
      "totalAmount": 228480,
      "odometer": 284100,
      "stationName": "Pronto Ruta 5",
      "kmPerLiter": 3.1,
      "deviationStatus": "NORMAL",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "incidents": [
    {
      "id": "incident-001",
      "incidentNumber": "INC-2026-001",
      "truckId": "truck-002",
      "driverId": "driver-002",
      "freightId": "freight-request-001",
      "incidentType": "ACCIDENT",
      "severity": "CRITICAL",
      "description": "Golpe lateral con dano estructural menor, requiere evaluacion.",
      "occurredAt": "2026-05-02T18:30:00.000Z",
      "location": "Ruta 5 Sur km 122",
      "estimatedCost": 1450000,
      "status": "OPEN",
      "documents": [
        "/mock/parte-inc-001.pdf"
      ],
      "photos": [
        "/mock/inc-001.jpg"
      ],
      "notes": "Bloquea camion hasta cierre de revision.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "incident-002",
      "incidentNumber": "INC-2026-002",
      "truckId": "truck-002",
      "driverId": "driver-002",
      "incidentType": "FINE",
      "severity": "MEDIUM",
      "description": "Multa por documentacion vencida.",
      "occurredAt": "2026-05-01T12:00:00.000Z",
      "location": "Control carretero Angostura",
      "estimatedCost": 145000,
      "status": "UNDER_REVIEW",
      "documents": [
        "/mock/multa-002.pdf"
      ],
      "photos": [],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "incident-003",
      "incidentNumber": "INC-2026-003",
      "truckId": "truck-004",
      "driverId": "driver-004",
      "freightId": "freight-request-004",
      "incidentType": "DELAY",
      "severity": "LOW",
      "description": "Retraso por espera en planta cliente.",
      "occurredAt": "2026-05-04T11:40:00.000Z",
      "location": "Los Andes",
      "estimatedCost": 80000,
      "status": "RESOLVED",
      "documents": [],
      "photos": [],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "labor-tasks": [
    {
      "id": "labor-001",
      "caseId": "case-001",
      "description": "Diagnostico sistema combustible",
      "estimatedHours": 2,
      "realHours": 1.5,
      "mechanicId": "mechanic-001",
      "mechanicName": "Daniel Rivas",
      "hourlyRate": 42000,
      "status": "in_progress",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "labor-002",
      "caseId": "case-002",
      "description": "Reparacion linea de aire y valvula moduladora",
      "estimatedHours": 6,
      "realHours": 4,
      "mechanicId": "mechanic-002",
      "mechanicName": "Paula Fuentes",
      "hourlyRate": 48000,
      "status": "in_progress",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "labor-003",
      "caseId": "case-003",
      "description": "Revision tren delantero y suspension",
      "estimatedHours": 3,
      "mechanicId": "mechanic-003",
      "mechanicName": "Marco Silva",
      "hourlyRate": 39000,
      "status": "pending",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "labor-004",
      "caseId": "case-004",
      "description": "Prueba final y ajuste de embrague",
      "estimatedHours": 2,
      "realHours": 2.2,
      "mechanicId": "mechanic-004",
      "mechanicName": "Camila Herrera",
      "hourlyRate": 52000,
      "status": "done",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "mechanic-specialties": [
    {
      "id": "mechanic-specialty-engine",
      "code": "MOT-DIESEL",
      "name": "Motor diesel",
      "category": "Mecanica pesada",
      "description": "Diagnostico, inyeccion, potencia, filtros y fallas de motor diesel.",
      "status": "active",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "mechanic-specialty-brakes",
      "code": "FRE-AIRE",
      "name": "Frenos y suspension",
      "category": "Seguridad operacional",
      "description": "Circuitos de aire, valvulas, frenos, suspension y bloqueos de seguridad.",
      "status": "active",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "mechanic-specialty-front-axle",
      "code": "TRE-DEL",
      "name": "Tren delantero",
      "category": "Rodado y direccion",
      "description": "Direccion, terminales, alineacion, vibraciones y tren delantero.",
      "status": "active",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "mechanic-specialty-transmission",
      "code": "TRANS",
      "name": "Transmision",
      "category": "Powertrain",
      "description": "Embrague, caja, cardan, diferencial y pruebas finales de transmision.",
      "status": "active",
      "createdBy": "Sistema",
      "updatedBy": "Sistema",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "mechanics": [
    {
      "id": "mechanic-001",
      "userId": "user-005",
      "userName": "Daniel Rivas",
      "email": "daniel@taller.local",
      "roleCode": "MECANICO",
      "name": "Daniel Rivas",
      "specialtyId": "mechanic-specialty-engine",
      "specialty": "Motor diesel",
      "availability": "busy",
      "activeCases": 3,
      "maxCases": 4,
      "shift": "08:00 - 17:00",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "mechanic-002",
      "userId": "user-006",
      "userName": "Paula Fuentes",
      "email": "paula@taller.local",
      "roleCode": "MECANICO",
      "name": "Paula Fuentes",
      "specialtyId": "mechanic-specialty-brakes",
      "specialty": "Frenos y suspension",
      "availability": "busy",
      "activeCases": 4,
      "maxCases": 4,
      "shift": "08:00 - 17:00",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "mechanic-003",
      "userId": "user-007",
      "userName": "Marco Silva",
      "email": "marco@taller.local",
      "roleCode": "MECANICO",
      "name": "Marco Silva",
      "specialtyId": "mechanic-specialty-front-axle",
      "specialty": "Tren delantero",
      "availability": "available",
      "activeCases": 2,
      "maxCases": 4,
      "shift": "12:00 - 21:00",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "mechanic-004",
      "userId": "user-008",
      "userName": "Camila Herrera",
      "email": "camila@taller.local",
      "roleCode": "MECANICO",
      "name": "Camila Herrera",
      "specialtyId": "mechanic-specialty-transmission",
      "specialty": "Transmision",
      "availability": "available",
      "activeCases": 1,
      "maxCases": 3,
      "shift": "08:00 - 17:00",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "notifications": [
    {
      "id": "notification-telematics-speed-001",
      "title": "Velocidad y desvio de ruta",
      "message": "Camion SC-FR-77 registra exceso de velocidad y desvio activo. Revisar GPS antes de continuar despacho.",
      "category": "operations",
      "severity": "critical",
      "status": "unread",
      "sourceModule": "Telemetria / GPS",
      "relatedEntityType": "truck",
      "relatedEntityId": "truck-005",
      "relatedEntityLabel": "SC-FR-77",
      "actionPath": "/telematics",
      "assignedTo": "Supervisor flota",
      "dueAt": "2026-05-07T19:30:00.000Z",
      "createdBy": "Sistema GPS",
      "updatedBy": "Sistema GPS",
      "createdAt": "2026-05-07T18:45:00.000Z",
      "updatedAt": "2026-05-07T18:45:00.000Z"
    },
    {
      "id": "notification-quote-approval-001",
      "title": "Cotizacion pendiente de respuesta",
      "message": "COT-2026-0012 fue enviada y vence pronto. Conviene contactar al cliente desde comunicaciones.",
      "category": "commercial",
      "severity": "warning",
      "status": "unread",
      "sourceModule": "Cotizaciones taller",
      "relatedEntityType": "quote",
      "relatedEntityId": "quote-001",
      "relatedEntityLabel": "COT-2026-0012",
      "actionPath": "/quotes/quote-001",
      "assignedTo": "Recepcion taller",
      "dueAt": "2026-05-08T18:00:00.000Z",
      "createdBy": "Sistema comercial",
      "updatedBy": "Sistema comercial",
      "createdAt": "2026-05-07T14:10:00.000Z",
      "updatedAt": "2026-05-07T14:10:00.000Z"
    },
    {
      "id": "notification-stock-low-001",
      "title": "Stock critico de repuesto",
      "message": "Valvula moduladora freno esta bajo minimo. Revisar SKUs y ordenes de compra asociadas.",
      "category": "inventory",
      "severity": "warning",
      "status": "unread",
      "sourceModule": "Gestion inventario",
      "relatedEntityType": "part",
      "relatedEntityId": "part-002",
      "relatedEntityLabel": "Valvula moduladora freno",
      "actionPath": "/parts/part-002",
      "assignedTo": "Bodega",
      "dueAt": "2026-05-08T12:00:00.000Z",
      "createdBy": "Sistema inventario",
      "updatedBy": "Sistema inventario",
      "createdAt": "2026-05-07T11:25:00.000Z",
      "updatedAt": "2026-05-07T11:25:00.000Z"
    },
    {
      "id": "notification-document-expiry-001",
      "title": "Documento de camion por vencer",
      "message": "Permiso de circulacion asociado a TR-4521 vence esta semana.",
      "category": "maintenance",
      "severity": "info",
      "status": "read",
      "sourceModule": "Documentacion flota",
      "relatedEntityType": "truck-document",
      "relatedEntityId": "truck-doc-002",
      "relatedEntityLabel": "TR-4521",
      "actionPath": "/truck-documents/truck-doc-002",
      "assignedTo": "Administracion flota",
      "readAt": "2026-05-07T10:40:00.000Z",
      "createdBy": "Sistema documentos",
      "updatedBy": "Administracion flota",
      "createdAt": "2026-05-07T09:30:00.000Z",
      "updatedAt": "2026-05-07T10:40:00.000Z"
    },
    {
      "id": "notification-case-escalated-001",
      "title": "Caso escalado a supervisor",
      "message": "TW-2026-002 supera ventana SLA y requiere decision de taller.",
      "category": "maintenance",
      "severity": "critical",
      "status": "unread",
      "sourceModule": "Casos taller",
      "relatedEntityType": "case",
      "relatedEntityId": "case-002",
      "relatedEntityLabel": "TW-2026-002",
      "actionPath": "/cases/case-002",
      "assignedTo": "Jefe taller",
      "dueAt": "2026-05-07T20:00:00.000Z",
      "createdBy": "Motor SLA",
      "updatedBy": "Motor SLA",
      "createdAt": "2026-05-07T17:05:00.000Z",
      "updatedAt": "2026-05-07T17:05:00.000Z"
    }
  ],
  "parts": [
    {
      "id": "part-001",
      "sku": "FLT-9001",
      "name": "Filtro combustible alto flujo",
      "category": "Motor",
      "stock": 12,
      "minStock": 6,
      "unitCost": 48900,
      "createdAt": "2026-04-01T10:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-01T12:30:00.000Z",
      "updatedBy": "Admin Taller"
    },
    {
      "id": "part-002",
      "sku": "BRK-2210",
      "name": "Valvula moduladora freno",
      "category": "Frenos",
      "stock": 2,
      "minStock": 4,
      "unitCost": 315000,
      "createdAt": "2026-04-02T10:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-02T12:30:00.000Z",
      "updatedBy": "Natalia Perez"
    },
    {
      "id": "part-003",
      "sku": "SUS-1188",
      "name": "Buje barra estabilizadora",
      "category": "Suspension",
      "stock": 18,
      "minStock": 10,
      "unitCost": 27900,
      "createdAt": "2026-04-03T10:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-03T12:30:00.000Z",
      "updatedBy": "Oscar Valdes"
    },
    {
      "id": "part-004",
      "sku": "TRN-7844",
      "name": "Kit embrague pesado",
      "category": "Transmision",
      "stock": 3,
      "minStock": 2,
      "unitCost": 790000,
      "createdAt": "2026-04-04T10:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-04T12:30:00.000Z",
      "updatedBy": "Admin Taller"
    },
    {
      "id": "part-101",
      "sku": "NEU-TRAC-001",
      "name": "Neumatico traccion 295/80R22.5 nuevo",
      "category": "Neumaticos",
      "stock": 4,
      "minStock": 2,
      "unitCost": 450000,
      "createdAt": "2026-04-05T10:00:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-05T12:30:00.000Z",
      "updatedBy": "Admin Taller"
    },
    {
      "id": "part-102",
      "sku": "NEU-REC-001",
      "name": "Neumatico traccion 295/80R22.5 recauchado",
      "category": "Neumaticos",
      "stock": 6,
      "minStock": 3,
      "unitCost": 180000,
      "createdAt": "2026-04-06T10:00:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-06T12:30:00.000Z",
      "updatedBy": "Compras"
    },
    {
      "id": "part-103",
      "sku": "NEU-DIR-002",
      "name": "Neumatico direccion 315/80R22.5 nuevo",
      "category": "Neumaticos",
      "stock": 3,
      "minStock": 2,
      "unitCost": 520000,
      "createdAt": "2026-04-07T10:00:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-07T12:30:00.000Z",
      "updatedBy": "Compras"
    },
    {
      "id": "part-104",
      "sku": "NEU-ARR-003",
      "name": "Neumatico arrastre 385/65R22.5 nuevo",
      "category": "Neumaticos",
      "stock": 2,
      "minStock": 2,
      "unitCost": 410000,
      "createdAt": "2026-04-08T10:00:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-08T12:30:00.000Z",
      "updatedBy": "Compras"
    },
    {
      "id": "part-105",
      "sku": "NEU-REC-ARR-004",
      "name": "Neumatico arrastre 385/65R22.5 recauchado",
      "category": "Neumaticos",
      "stock": 5,
      "minStock": 3,
      "unitCost": 165000,
      "createdAt": "2026-04-09T10:00:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-09T12:30:00.000Z",
      "updatedBy": "Compras"
    }
  ],
  "preventive-maintenance-plans": [
    {
      "id": "maintenance-001",
      "truckId": "truck-001",
      "maintenanceType": "OIL_CHANGE",
      "description": "Cambio aceite motor y filtros principales",
      "frequencyType": "BOTH",
      "everyKm": 15000,
      "everyDays": 90,
      "lastDoneAt": "2026-02-15T09:00:00.000Z",
      "lastDoneOdometer": 270000,
      "nextDueAt": "2026-05-15T09:00:00.000Z",
      "nextDueOdometer": 285000,
      "riskStatus": "WARNING",
      "assignedTo": "Jefe taller",
      "notes": "Quedan cerca de 900 km por odometro actual.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "maintenance-002",
      "truckId": "truck-002",
      "maintenanceType": "TECHNICAL_INSPECTION",
      "description": "Revision tecnica anual",
      "frequencyType": "DATE",
      "everyDays": 365,
      "lastDoneAt": "2025-04-20T09:00:00.000Z",
      "nextDueAt": "2026-04-20T09:00:00.000Z",
      "riskStatus": "OVERDUE",
      "assignedTo": "Backoffice flota",
      "notes": "Bloquea disponibilidad real para fletes.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "maintenance-003",
      "truckId": "truck-003",
      "maintenanceType": "BATTERY",
      "description": "Prueba bateria y sistema de carga",
      "frequencyType": "DATE",
      "everyDays": 180,
      "lastDoneAt": "2025-11-15T09:00:00.000Z",
      "nextDueAt": "2026-05-10T09:00:00.000Z",
      "riskStatus": "CRITICAL",
      "assignedTo": "Electrico",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "maintenance-004",
      "truckId": "truck-004",
      "maintenanceType": "BRAKES",
      "description": "Inspeccion frenos y regulacion",
      "frequencyType": "KM",
      "everyKm": 20000,
      "lastDoneOdometer": 389000,
      "nextDueOdometer": 409000,
      "riskStatus": "OK",
      "assignedTo": "Mecanico ruta",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "maintenance-005",
      "truckId": "truck-005",
      "maintenanceType": "TIRES",
      "description": "Rotacion y control presion refrigerado",
      "frequencyType": "BOTH",
      "everyKm": 12000,
      "everyDays": 60,
      "lastDoneAt": "2026-04-29T08:00:00.000Z",
      "lastDoneOdometer": 94120,
      "nextDueAt": "2026-06-28T08:00:00.000Z",
      "nextDueOdometer": 106120,
      "riskStatus": "OK",
      "assignedTo": "Bodega neumaticos",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "purchase-orders": [
    {
      "id": "po-001",
      "purchaseOrderNumber": "OC-2026-0007",
      "supplierName": "Frenos Andinos Ltda.",
      "status": "ORDERED",
      "relatedCaseId": "case-002",
      "requestedBy": "Felipe Araya",
      "approvedBy": "Javier Torres",
      "items": [
        {
          "partId": "part-002",
          "sku": "BRK-2210",
          "name": "Valvula moduladora freno",
          "quantity": 2,
          "estimatedUnitCost": 315000,
          "requiredForCaseId": "case-002"
        }
      ],
      "totalEstimated": 630000,
      "createdAt": "2026-05-04T16:20:00.000Z",
      "expectedDeliveryDate": "2026-05-07T18:00:00.000Z",
      "updatedAt": "2026-05-04T16:20:00.000Z"
    },
    {
      "id": "po-002",
      "purchaseOrderNumber": "OC-2026-0008",
      "supplierName": "Transmisiones Sur",
      "status": "PARTIALLY_RECEIVED",
      "relatedCaseId": "case-004",
      "requestedBy": "Felipe Araya",
      "approvedBy": "Javier Torres",
      "items": [
        {
          "partId": "part-004",
          "sku": "TRN-7844",
          "name": "Kit embrague pesado",
          "quantity": 1,
          "estimatedUnitCost": 790000,
          "requiredForCaseId": "case-004"
        }
      ],
      "totalEstimated": 790000,
      "createdAt": "2026-05-02T12:05:00.000Z",
      "expectedDeliveryDate": "2026-05-06T13:00:00.000Z",
      "updatedAt": "2026-05-02T12:05:00.000Z"
    },
    {
      "id": "po-003",
      "purchaseOrderNumber": "OC-2026-0009",
      "supplierName": "Diesel Norte",
      "status": "REQUESTED",
      "requestedBy": "Felipe Araya",
      "items": [
        {
          "partId": "part-001",
          "sku": "FLT-9001",
          "name": "Filtro combustible alto flujo",
          "quantity": 10,
          "estimatedUnitCost": 48900
        }
      ],
      "totalEstimated": 489000,
      "createdAt": "2026-05-05T08:45:00.000Z",
      "expectedDeliveryDate": "2026-05-09T18:00:00.000Z",
      "updatedAt": "2026-05-05T08:45:00.000Z"
    },
    {
      "id": "po-004",
      "purchaseOrderNumber": "OC-2026-0010",
      "supplierName": "Neumaticos Pacifico",
      "status": "RECEIVED",
      "requestedBy": "Felipe Araya",
      "approvedBy": "Javier Torres",
      "items": [
        {
          "partId": "part-101",
          "sku": "NEU-TRAC-001",
          "name": "Neumatico traccion 295/80R22.5 nuevo",
          "quantity": 4,
          "estimatedUnitCost": 450000
        },
        {
          "partId": "part-103",
          "sku": "NEU-DIR-002",
          "name": "Neumatico direccion 315/80R22.5 nuevo",
          "quantity": 2,
          "estimatedUnitCost": 520000
        }
      ],
      "totalEstimated": 2840000,
      "createdAt": "2026-03-12T10:00:00.000Z",
      "expectedDeliveryDate": "2026-03-15T18:00:00.000Z",
      "updatedAt": "2026-03-12T10:00:00.000Z"
    },
    {
      "id": "po-005",
      "purchaseOrderNumber": "OC-2026-0011",
      "supplierName": "Recauchajes Ruta Sur",
      "status": "RECEIVED",
      "requestedBy": "Felipe Araya",
      "approvedBy": "Javier Torres",
      "items": [
        {
          "partId": "part-102",
          "sku": "NEU-REC-001",
          "name": "Neumatico traccion 295/80R22.5 recauchado",
          "quantity": 6,
          "estimatedUnitCost": 180000
        },
        {
          "partId": "part-105",
          "sku": "NEU-REC-ARR-004",
          "name": "Neumatico arrastre 385/65R22.5 recauchado",
          "quantity": 4,
          "estimatedUnitCost": 165000
        }
      ],
      "totalEstimated": 1740000,
      "createdAt": "2026-03-18T10:00:00.000Z",
      "expectedDeliveryDate": "2026-03-22T18:00:00.000Z",
      "updatedAt": "2026-03-18T10:00:00.000Z"
    }
  ],
  "purchase-invoices": [
    {
      "id": "pinv-001",
      "invoiceNumber": "F-48213",
      "supplierId": "sup-001",
      "supplierName": "Frenos Andinos Ltda.",
      "purchaseOrderId": "po-001",
      "purchaseOrderNumber": "OC-2026-0007",
      "status": "REGISTERED",
      "invoiceDate": "2026-06-20T12:00:00.000Z",
      "receivedAt": "2026-06-21T09:30:00.000Z",
      "dueDate": "2026-07-20T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "items": [
        {
          "sku": "BRK-2210",
          "name": "Valvula moduladora freno",
          "orderedQuantity": 2,
          "receivedQuantity": 2,
          "invoicedQuantity": 2,
          "unitPrice": 315000
        }
      ],
      "net": 630000,
      "tax": 119700,
      "total": 749700,
      "notes": "Pendiente de conciliar contra recepcion.",
      "createdAt": "2026-06-21T09:35:00.000Z",
      "updatedAt": "2026-06-21T09:35:00.000Z"
    },
    {
      "id": "pinv-002",
      "invoiceNumber": "F-90455",
      "supplierId": "sup-002",
      "supplierName": "Lubricantes del Sur SA",
      "purchaseOrderId": "po-002",
      "purchaseOrderNumber": "OC-2026-0008",
      "status": "WITH_DIFFERENCE",
      "invoiceDate": "2026-06-18T12:00:00.000Z",
      "receivedAt": "2026-06-19T10:00:00.000Z",
      "dueDate": "2026-07-18T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "items": [
        {
          "sku": "OIL-15W40",
          "name": "Aceite motor 15W40 (tambor)",
          "orderedQuantity": 10,
          "receivedQuantity": 8,
          "invoicedQuantity": 10,
          "unitPrice": 48000
        }
      ],
      "net": 480000,
      "tax": 91200,
      "total": 571200,
      "notes": "Diferencia: se facturan 10 pero se recibieron 8. Retener pago.",
      "createdAt": "2026-06-19T10:05:00.000Z",
      "updatedAt": "2026-06-19T10:05:00.000Z"
    },
    {
      "id": "pinv-003",
      "invoiceNumber": "F-11782",
      "supplierId": "sup-003",
      "supplierName": "Neumaticos Pacifico SpA",
      "purchaseOrderId": "po-003",
      "purchaseOrderNumber": "OC-2026-0009",
      "status": "APPROVED",
      "invoiceDate": "2026-06-10T12:00:00.000Z",
      "receivedAt": "2026-06-11T11:00:00.000Z",
      "dueDate": "2026-07-10T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "items": [
        {
          "sku": "TIRE-1100R20",
          "name": "Neumatico 1100R20",
          "orderedQuantity": 6,
          "receivedQuantity": 6,
          "invoicedQuantity": 6,
          "unitPrice": 240000
        }
      ],
      "net": 1440000,
      "tax": 273600,
      "total": 1713600,
      "approvedBy": "Javier Torres",
      "approvedAt": "2026-06-12T15:00:00.000Z",
      "notes": "Conciliada y aprobada. Pendiente registro contable.",
      "createdAt": "2026-06-11T11:10:00.000Z",
      "updatedAt": "2026-06-11T11:10:00.000Z"
    },
    {
      "id": "pinv-004",
      "invoiceNumber": "F-30021",
      "supplierId": "sup-001",
      "supplierName": "Frenos Andinos Ltda.",
      "purchaseOrderId": "po-004",
      "purchaseOrderNumber": "OC-2026-0005",
      "status": "PAID",
      "invoiceDate": "2026-05-12T12:00:00.000Z",
      "receivedAt": "2026-05-13T09:00:00.000Z",
      "dueDate": "2026-06-11T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "items": [
        {
          "sku": "BRK-1180",
          "name": "Pastillas de freno (juego)",
          "orderedQuantity": 8,
          "receivedQuantity": 8,
          "invoicedQuantity": 8,
          "unitPrice": 62000
        }
      ],
      "net": 496000,
      "tax": 94240,
      "total": 590240,
      "approvedBy": "Javier Torres",
      "approvedAt": "2026-05-15T10:00:00.000Z",
      "accountingEntry": "AS-2026-0412",
      "accountedAt": "2026-05-16T09:00:00.000Z",
      "paidAt": "2026-06-10T14:30:00.000Z",
      "paymentReference": "TRF-889217",
      "notes": "Ciclo completo: conciliada, aprobada, contabilizada y pagada.",
      "createdAt": "2026-05-13T09:10:00.000Z",
      "updatedAt": "2026-05-13T09:10:00.000Z"
    }
  ],
  "freight-invoices": [
    {
      "id": "finv-001",
      "invoiceNumber": "F-001245",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "status": "SENT",
      "issueDate": "2026-06-07T12:00:00.000Z",
      "dueDate": "2026-07-07T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "periodStart": "2026-06-01T00:00:00.000Z",
      "periodEnd": "2026-06-07T23:59:59.000Z",
      "lines": [
        {
          "date": "2026-06-02T00:00:00.000Z",
          "description": "Flete contenedor 40 - Talca -> Puerto San Antonio",
          "reference": "FLE-2026-021",
          "kind": "FREIGHT",
          "amount": 250000
        },
        {
          "date": "2026-06-04T00:00:00.000Z",
          "description": "Flete contenedor 20 - Rancagua -> Puerto Valparaiso",
          "reference": "FLE-2026-024",
          "kind": "FREIGHT",
          "amount": 180000
        },
        {
          "date": "2026-06-06T00:00:00.000Z",
          "description": "Flete contenedor reefer - Curico -> Puerto San Antonio",
          "reference": "FLE-2026-028",
          "kind": "FREIGHT",
          "amount": 320000
        },
        {
          "date": "2026-06-06T00:00:00.000Z",
          "description": "Peajes ruta",
          "kind": "SURCHARGE",
          "amount": 35000
        },
        {
          "date": "2026-06-06T00:00:00.000Z",
          "description": "Espera de contenedor en puerto",
          "kind": "SURCHARGE",
          "amount": 20000
        }
      ],
      "backupDocuments": [
        "Carta de porte",
        "Comprobante de entrega firmado",
        "Registro GPS",
        "Documentos del puerto"
      ],
      "net": 805000,
      "tax": 152950,
      "total": 957950,
      "sentAt": "2026-06-07T15:00:00.000Z",
      "notes": "Consolidado semanal. Enviada con respaldos, en espera de aprobacion del cliente.",
      "createdAt": "2026-06-07T14:30:00.000Z",
      "updatedAt": "2026-06-07T14:30:00.000Z"
    },
    {
      "id": "finv-002",
      "invoiceNumber": "F-001239",
      "customerId": "customer-maipo",
      "customerName": "Transportes Maipo",
      "status": "APPROVED",
      "issueDate": "2026-06-03T12:00:00.000Z",
      "dueDate": "2026-07-03T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "periodStart": "2026-05-26T00:00:00.000Z",
      "periodEnd": "2026-06-01T23:59:59.000Z",
      "lines": [
        {
          "date": "2026-05-28T00:00:00.000Z",
          "description": "Flete Talca -> Puerto San Antonio",
          "reference": "FLE-2026-018",
          "kind": "FREIGHT",
          "amount": 250000
        },
        {
          "date": "2026-05-30T00:00:00.000Z",
          "description": "Peajes ruta",
          "kind": "SURCHARGE",
          "amount": 35000
        },
        {
          "date": "2026-05-30T00:00:00.000Z",
          "description": "Espera de contenedor",
          "kind": "SURCHARGE",
          "amount": 20000
        }
      ],
      "backupDocuments": [
        "Carta de porte",
        "Comprobante de entrega"
      ],
      "net": 305000,
      "tax": 57950,
      "total": 362950,
      "sentAt": "2026-06-03T16:00:00.000Z",
      "approvedAt": "2026-06-05T11:00:00.000Z",
      "approvedBy": "Marcela Soto (Transportes Maipo)",
      "notes": "Aprobada por el cliente. En cuentas por cobrar.",
      "createdAt": "2026-06-03T15:30:00.000Z",
      "updatedAt": "2026-06-03T15:30:00.000Z"
    },
    {
      "id": "finv-003",
      "invoiceNumber": "F-001210",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "status": "PAID",
      "issueDate": "2026-05-10T12:00:00.000Z",
      "dueDate": "2026-06-09T12:00:00.000Z",
      "paymentTerms": "DIAS_30",
      "periodStart": "2026-05-01T00:00:00.000Z",
      "periodEnd": "2026-05-09T23:59:59.000Z",
      "lines": [
        {
          "date": "2026-05-05T00:00:00.000Z",
          "description": "Flete contenedor 40 - Linares -> Puerto San Antonio",
          "reference": "FLE-2026-009",
          "kind": "FREIGHT",
          "amount": 280000
        },
        {
          "date": "2026-05-07T00:00:00.000Z",
          "description": "Flete contenedor 20 - Talca -> Puerto Valparaiso",
          "reference": "FLE-2026-012",
          "kind": "FREIGHT",
          "amount": 190000
        }
      ],
      "backupDocuments": [
        "Carta de porte",
        "Comprobante de entrega",
        "Registro GPS"
      ],
      "net": 470000,
      "tax": 89300,
      "total": 559300,
      "sentAt": "2026-05-10T15:00:00.000Z",
      "approvedAt": "2026-05-12T10:00:00.000Z",
      "approvedBy": "Luis Herrera (Ruta Norte)",
      "paidAt": "2026-06-08T13:00:00.000Z",
      "paymentReference": "TRF-552310",
      "notes": "Ciclo completo: emitida, enviada, aprobada y pagada.",
      "createdAt": "2026-05-10T14:30:00.000Z",
      "updatedAt": "2026-05-10T14:30:00.000Z"
    }
  ],
  "purchase-requests": [
    {
      "id": "prq-001",
      "caseId": "case-001",
      "partId": "part-002",
      "sku": "BRK-2210",
      "name": "Valvula moduladora freno",
      "quantity": 1,
      "requestedBy": "Natalia Perez",
      "status": "open",
      "createdAt": "2026-05-05T10:15:00.000Z",
      "updatedAt": "2026-05-05T10:15:00.000Z"
    },
    {
      "id": "prq-002",
      "caseId": "case-002",
      "partId": "part-002",
      "sku": "BRK-2210",
      "name": "Valvula moduladora freno",
      "quantity": 2,
      "requestedBy": "Paula Fuentes",
      "status": "linked_to_po",
      "purchaseOrderId": "po-001",
      "createdAt": "2026-05-04T15:40:00.000Z",
      "updatedAt": "2026-05-04T15:40:00.000Z"
    },
    {
      "id": "prq-003",
      "caseId": "case-004",
      "partId": "part-004",
      "sku": "TRN-7844",
      "name": "Kit embrague pesado",
      "quantity": 1,
      "requestedBy": "Camila Herrera",
      "status": "linked_to_po",
      "purchaseOrderId": "po-002",
      "createdAt": "2026-05-02T11:30:00.000Z",
      "updatedAt": "2026-05-02T11:30:00.000Z"
    }
  ],
  "quotes": [
    {
      "id": "quote-001",
      "quoteNumber": "COT-2026-0012",
      "caseId": "case-001",
      "caseNumber": "TW-2026-001",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "diagnosisSummary": "Sistema de combustible con filtro saturado y valvula de freno con stock bajo.",
      "status": "SENT",
      "items": [
        {
          "id": "ql-001",
          "type": "part",
          "description": "Filtro combustible alto flujo",
          "quantity": 2,
          "unitPrice": 48900
        },
        {
          "id": "ql-002",
          "type": "labor",
          "description": "Diagnostico y recambio sistema combustible",
          "quantity": 3,
          "unitPrice": 42000
        }
      ],
      "total": 223800,
      "createdAt": "2026-05-05T10:30:00.000Z",
      "expiresAt": "2026-05-08T18:00:00.000Z",
      "updatedAt": "2026-05-05T10:30:00.000Z"
    },
    {
      "id": "quote-002",
      "quoteNumber": "COT-2026-0013",
      "caseId": "case-002",
      "caseNumber": "TW-2026-002",
      "customerId": "customer-maipo",
      "customerName": "Transportes Maipo",
      "diagnosisSummary": "Reparacion critica de frenos con cambio de valvula moduladora.",
      "status": "APPROVED",
      "items": [
        {
          "id": "ql-003",
          "type": "part",
          "description": "Valvula moduladora freno",
          "quantity": 2,
          "unitPrice": 315000
        },
        {
          "id": "ql-004",
          "type": "labor",
          "description": "Reparacion sistema de frenos",
          "quantity": 6,
          "unitPrice": 48000
        }
      ],
      "total": 918000,
      "createdAt": "2026-05-04T16:40:00.000Z",
      "expiresAt": "2026-05-06T18:00:00.000Z",
      "approvedBy": "Jefe de taller",
      "updatedAt": "2026-05-04T16:40:00.000Z"
    },
    {
      "id": "quote-003",
      "quoteNumber": "COT-2026-0014",
      "caseId": "case-004",
      "caseNumber": "TW-2026-004",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "diagnosisSummary": "Kit de embrague y prueba final de entrega.",
      "status": "DRAFT",
      "items": [
        {
          "id": "ql-005",
          "type": "part",
          "description": "Kit embrague pesado",
          "quantity": 1,
          "unitPrice": 790000
        },
        {
          "id": "ql-006",
          "type": "labor",
          "description": "Prueba final y ajuste de transmision",
          "quantity": 2,
          "unitPrice": 52000
        }
      ],
      "total": 894000,
      "createdAt": "2026-05-05T09:00:00.000Z",
      "expiresAt": "2026-05-07T18:00:00.000Z",
      "updatedAt": "2026-05-05T09:00:00.000Z"
    }
  ],
  "repair-solutions": [
    {
      "approvalRequired": true,
      "caseId": "case-001",
      "createdAt": "2026-05-02T09:30:00.000Z",
      "estimatedCost": 680000,
      "id": "repair-solution-case-001",
      "laborHours": 4,
      "requiredParts": [
        {
          "partId": "part-001",
          "sku": "FLT-9001",
          "name": "Filtro combustible alto flujo",
          "quantity": 2,
          "stockAvailable": 12,
          "status": "available",
          "requiresPurchase": false
        },
        {
          "partId": "part-002",
          "sku": "BRK-2210",
          "name": "Valvula moduladora freno",
          "quantity": 1,
          "stockAvailable": 2,
          "status": "purchase_required",
          "requiresPurchase": true,
          "purchaseRequestId": "prq-001"
        }
      ],
      "summary": "Diagnosticar problema",
      "updatedAt": "2026-05-05T10:30:00.000Z"
    },
    {
      "approvalRequired": true,
      "caseId": "case-002",
      "createdAt": "2026-05-03T13:10:00.000Z",
      "estimatedCost": 920000,
      "id": "repair-solution-case-002",
      "laborHours": 2,
      "requiredParts": [
        {
          "partId": "part-002",
          "sku": "BRK-2210",
          "name": "Valvula moduladora freno",
          "quantity": 2,
          "stockAvailable": 0,
          "status": "po_created",
          "requiresPurchase": true,
          "purchaseRequestId": "prq-002",
          "purchaseOrderId": "po-001"
        }
      ],
      "summary": "Ejecutar reparacion",
      "updatedAt": "2026-05-05T09:20:00.000Z"
    },
    {
      "approvalRequired": false,
      "caseId": "case-003",
      "createdAt": "2026-05-04T08:45:00.000Z",
      "estimatedCost": 430000,
      "id": "repair-solution-case-003",
      "laborHours": 2,
      "requiredParts": [
        {
          "partId": "part-003",
          "sku": "SUS-1188",
          "name": "Buje barra estabilizadora",
          "quantity": 4,
          "stockAvailable": 18,
          "status": "available",
          "requiresPurchase": false
        }
      ],
      "summary": "Asignar responsable",
      "updatedAt": "2026-05-04T16:15:00.000Z"
    },
    {
      "approvalRequired": true,
      "caseId": "case-004",
      "createdAt": "2026-04-30T11:15:00.000Z",
      "estimatedCost": 1250000,
      "id": "repair-solution-case-004",
      "laborHours": 2,
      "requiredParts": [
        {
          "partId": "part-004",
          "sku": "TRN-7844",
          "name": "Kit embrague pesado",
          "quantity": 1,
          "stockAvailable": 0,
          "status": "waiting_reception",
          "requiresPurchase": true,
          "purchaseRequestId": "prq-003",
          "purchaseOrderId": "po-002"
        }
      ],
      "summary": "Probar camion",
      "updatedAt": "2026-05-05T08:45:00.000Z"
    }
  ],
  "roles": [
    {
      "id": "role-admin",
      "code": "ADMIN",
      "name": "Administrador",
      "description": "Acceso completo a configuracion y operacion.",
      "permissions": [
        "cases.view",
        "cases.create",
        "cases.diagnose",
        "cases.assign",
        "cases.escalate",
        "cases.close",
        "drivers.manage",
        "warehouse.manage",
        "purchaseOrders.create",
        "purchaseOrders.approve",
        "freight.requests.view",
        "freight.requests.create",
        "freight.quotes.create",
        "freight.quotes.send",
        "freight.quotes.decide",
        "freight.assign",
        "freight.assignments.view",
        "fleet.view",
        "fleet.manage",
        "fleet.availability",
        "fleet.maintenance",
        "fleet.documents",
        "fleet.fuel",
        "fleet.costs",
        "fleet.incidents",
        "fleet.telematics",
        "permissions.manage",
        "reports.view"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "role-jefe-taller",
      "code": "JEFE_TALLER",
      "name": "Jefe de taller",
      "description": "Gestiona casos, diagnosticos, asignaciones y escalamiento.",
      "permissions": [
        "cases.view",
        "cases.create",
        "cases.diagnose",
        "cases.assign",
        "cases.escalate",
        "cases.close",
        "fleet.availability",
        "fleet.maintenance",
        "reports.view"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "role-recepcion",
      "code": "RECEPCION",
      "name": "Recepcion",
      "description": "Registra camiones, choferes y nuevos casos.",
      "permissions": [
        "cases.view",
        "cases.create",
        "drivers.manage",
        "fleet.view",
        "freight.requests.view",
        "freight.requests.create"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "role-mecanico",
      "code": "MECANICO",
      "name": "Mecanico",
      "description": "Diagnostica y actualiza avances tecnicos.",
      "permissions": [
        "cases.view",
        "cases.diagnose"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "role-bodega",
      "code": "ENCARGADO_BODEGA",
      "name": "Encargado de bodega",
      "description": "Administra ubicaciones, stock y repuestos requeridos.",
      "permissions": [
        "cases.view",
        "warehouse.manage",
        "fleet.view",
        "fleet.maintenance"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "role-compras",
      "code": "COMPRAS",
      "name": "Compras",
      "description": "Genera y controla ordenes de compra.",
      "permissions": [
        "cases.view",
        "purchaseOrders.create",
        "purchaseOrders.approve",
        "freight.requests.view",
        "freight.quotes.create",
        "freight.quotes.send",
        "fleet.costs"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "role-supervisor",
      "code": "SUPERVISOR",
      "name": "Supervisor",
      "description": "Monitorea SLA, escalamiento y reportes.",
      "permissions": [
        "cases.view",
        "cases.assign",
        "cases.escalate",
        "reports.view",
        "freight.requests.view",
        "freight.quotes.decide",
        "freight.assign",
        "freight.assignments.view",
        "fleet.view",
        "fleet.availability",
        "fleet.costs",
        "fleet.incidents"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "schedule-events": [
    {
      "id": "schedule-001",
      "caseId": "case-001",
      "caseNumber": "TW-2026-001",
      "title": "Diagnostico potencia y combustible",
      "customerName": "Flota interna",
      "truckPlate": "HH-RR-24",
      "date": "2026-05-05",
      "startsAt": "2026-05-05T09:00:00.000-04:00",
      "endsAt": "2026-05-05T12:00:00.000-04:00",
      "estimatedHours": 3,
      "priority": "high",
      "slaStatus": "AT_RISK",
      "hasPartsBlock": false,
      "mechanicId": "mechanic-001",
      "mechanicName": "Daniel Rivas",
      "bayId": "bay-001",
      "bayName": "Estacion 1 motor",
      "status": "in_progress",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "schedule-002",
      "caseId": "case-002",
      "caseNumber": "TW-2026-002",
      "title": "Reparacion sistema de frenos",
      "customerName": "Flota interna",
      "truckPlate": "KL-DF-91",
      "date": "2026-05-05",
      "startsAt": "2026-05-05T10:30:00.000-04:00",
      "endsAt": "2026-05-05T16:30:00.000-04:00",
      "estimatedHours": 6,
      "priority": "critical",
      "slaStatus": "BREACHED",
      "hasPartsBlock": true,
      "mechanicId": "mechanic-002",
      "mechanicName": "Paula Fuentes",
      "bayId": "bay-002",
      "bayName": "Estacion 2 frenos",
      "status": "waiting_parts",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "schedule-003",
      "caseId": "case-003",
      "caseNumber": "TW-2026-003",
      "title": "Revision tren delantero",
      "customerName": "Flota interna",
      "truckPlate": "PR-JK-65",
      "date": "2026-05-06",
      "startsAt": "2026-05-06T08:30:00.000-04:00",
      "endsAt": "2026-05-06T11:30:00.000-04:00",
      "estimatedHours": 3,
      "priority": "medium",
      "slaStatus": "OK",
      "hasPartsBlock": false,
      "mechanicId": "mechanic-003",
      "mechanicName": "Marco Silva",
      "bayId": "bay-003",
      "bayName": "Diagnostico rapido",
      "status": "scheduled",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "schedule-004",
      "caseId": "case-004",
      "caseNumber": "TW-2026-004",
      "title": "Prueba final embrague",
      "customerName": "Flota interna",
      "truckPlate": "VX-TT-11",
      "date": "2026-05-05",
      "startsAt": "2026-05-05T14:00:00.000-04:00",
      "endsAt": "2026-05-05T16:00:00.000-04:00",
      "estimatedHours": 2,
      "priority": "high",
      "slaStatus": "AT_RISK",
      "hasPartsBlock": false,
      "mechanicId": "mechanic-004",
      "mechanicName": "Camila Herrera",
      "bayId": "bay-005",
      "bayName": "Prueba final",
      "status": "blocked",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "schedule-005",
      "caseId": "case-003",
      "caseNumber": "TW-2026-005",
      "title": "Cambio preventivo de neumaticos",
      "customerName": "Flota interna",
      "truckPlate": "BD-FR-80",
      "date": "2026-05-05",
      "startsAt": "2026-05-05T08:00:00.000-04:00",
      "endsAt": "2026-05-05T10:00:00.000-04:00",
      "estimatedHours": 2,
      "priority": "medium",
      "slaStatus": "OK",
      "hasPartsBlock": false,
      "mechanicId": "mechanic-003",
      "mechanicName": "Marco Silva",
      "bayId": "bay-003",
      "bayName": "Diagnostico rapido",
      "status": "scheduled",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "schedule-006",
      "caseId": "case-001",
      "caseNumber": "TW-2026-006",
      "title": "Revision electrica alternador",
      "customerName": "Flota interna",
      "truckPlate": "HH-RR-24",
      "date": "2026-05-05",
      "startsAt": "2026-05-05T11:00:00.000-04:00",
      "endsAt": "2026-05-05T13:30:00.000-04:00",
      "estimatedHours": 2.5,
      "priority": "low",
      "slaStatus": "OK",
      "hasPartsBlock": false,
      "mechanicId": "mechanic-003",
      "mechanicName": "Marco Silva",
      "bayId": "bay-003",
      "bayName": "Diagnostico rapido",
      "status": "scheduled",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "sla-configs": [
    {
      "id": "sla-critical",
      "name": "Critico 24h",
      "priority": "critical",
      "targetHours": 24,
      "atRiskHours": 6,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z",
      "escalationLevel": "LEVEL_0_NORMAL",
      "isActive": true
    },
    {
      "id": "sla-high",
      "name": "Alta 48h",
      "priority": "high",
      "targetHours": 48,
      "atRiskHours": 6,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z",
      "escalationLevel": "LEVEL_0_NORMAL",
      "isActive": true
    },
    {
      "id": "sla-medium",
      "name": "Media 72h",
      "priority": "medium",
      "targetHours": 72,
      "atRiskHours": 6,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z",
      "escalationLevel": "LEVEL_0_NORMAL",
      "isActive": true
    },
    {
      "id": "sla-low",
      "name": "Baja 96h",
      "priority": "low",
      "targetHours": 96,
      "atRiskHours": 6,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z",
      "escalationLevel": "LEVEL_0_NORMAL",
      "isActive": true
    }
  ],
  "suppliers": [
    {
      "id": "supplier-001",
      "name": "Frenos Andinos Ltda.",
      "rut": "76.445.901-2",
      "contactName": "Sofia Ramirez",
      "phone": "+56 2 2555 0101",
      "email": "ventas@frenosandinos.cl",
      "categories": [
        "Frenos",
        "Aire",
        "Valvulas"
      ],
      "averageDeliveryDays": 2,
      "rating": 4.7,
      "activePurchaseOrderIds": [
        "po-001"
      ],
      "status": "active",
      "notes": "Proveedor principal para sistemas de freno y aire.",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-01T15:30:00.000Z",
      "updatedBy": "Admin Taller"
    },
    {
      "id": "supplier-002",
      "name": "Transmisiones Sur",
      "rut": "77.180.220-9",
      "contactName": "Matias Lagos",
      "phone": "+56 2 2330 4400",
      "email": "contacto@transmisur.cl",
      "categories": [
        "Transmision",
        "Embrague"
      ],
      "averageDeliveryDays": 4,
      "rating": 4.2,
      "activePurchaseOrderIds": [
        "po-002"
      ],
      "status": "active",
      "notes": "Especialista en transmision y embrague.",
      "createdAt": "2026-04-03T11:15:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-04-28T13:20:00.000Z",
      "updatedBy": "Jefe Taller"
    },
    {
      "id": "supplier-003",
      "name": "Diesel Norte",
      "rut": "78.003.110-5",
      "contactName": "Carolina Vera",
      "phone": "+56 55 240 3030",
      "email": "repuestos@dieselnorte.cl",
      "categories": [
        "Motor",
        "Filtros",
        "Inyeccion"
      ],
      "averageDeliveryDays": 3,
      "rating": 4.5,
      "activePurchaseOrderIds": [
        "po-003"
      ],
      "status": "active",
      "notes": "Cobertura norte para motor, filtros e inyeccion.",
      "createdAt": "2026-04-05T09:40:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-04-30T16:10:00.000Z",
      "updatedBy": "Admin Taller"
    },
    {
      "id": "supplier-004",
      "name": "Neumaticos Pacifico",
      "rut": "76.990.110-8",
      "contactName": "Ignacio Rojas",
      "phone": "+56 2 2888 4400",
      "email": "flotas@neupacifico.cl",
      "categories": [
        "Neumaticos nuevos",
        "Direccion",
        "Traccion"
      ],
      "averageDeliveryDays": 3,
      "rating": 4.6,
      "activePurchaseOrderIds": [
        "po-004"
      ],
      "status": "active",
      "notes": "Convenio vigente para neumaticos de flota.",
      "createdAt": "2026-04-08T14:25:00.000Z",
      "createdBy": "Compras",
      "updatedAt": "2026-05-02T10:05:00.000Z",
      "updatedBy": "Compras"
    },
    {
      "id": "supplier-005",
      "name": "Recauchajes Ruta Sur",
      "rut": "77.540.300-1",
      "contactName": "Paola Cardenas",
      "phone": "+56 41 255 9090",
      "email": "ventas@rutasur.cl",
      "categories": [
        "Recauchados",
        "Arrastre",
        "Traccion"
      ],
      "averageDeliveryDays": 5,
      "rating": 4.4,
      "activePurchaseOrderIds": [
        "po-005"
      ],
      "status": "active",
      "notes": "Recauchajes para arrastre y traccion.",
      "createdAt": "2026-04-10T12:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-04-25T09:45:00.000Z",
      "updatedBy": "Jefe Taller"
    }
  ],
  "telematics": [
    {
      "id": "telemetry-truck-004",
      "truckId": "truck-004",
      "latitude": -33.045,
      "longitude": -70.68,
      "speed": 78,
      "odometer": 401230,
      "fuelLevel": 42,
      "engineStatus": "ON",
      "lastSignalAt": "2026-05-05T11:45:00.000Z",
      "idleMinutes": 8,
      "alerts": [],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "telemetry-truck-005",
      "truckId": "truck-005",
      "latitude": -33.4489,
      "longitude": -70.6693,
      "speed": 0,
      "odometer": 94120,
      "fuelLevel": 92,
      "engineStatus": "OFF",
      "lastSignalAt": "2026-05-05T11:40:00.000Z",
      "idleMinutes": 0,
      "alerts": [],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "telemetry-truck-002",
      "truckId": "truck-002",
      "latitude": -34.1708,
      "longitude": -70.7406,
      "speed": 0,
      "odometer": 319440,
      "fuelLevel": 18,
      "engineStatus": "IDLE",
      "lastSignalAt": "2026-05-05T10:10:00.000Z",
      "idleMinutes": 46,
      "alerts": [
        "LOW_FUEL",
        "LONG_STOP"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "telemetry-truck-001",
      "truckId": "truck-001",
      "latitude": -32.936,
      "longitude": -71.215,
      "speed": 0,
      "odometer": 284100,
      "fuelLevel": 36,
      "engineStatus": "OFF",
      "lastSignalAt": "2026-05-05T09:30:00.000Z",
      "idleMinutes": 0,
      "alerts": [
        "SIGNAL_LOST"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "telemetry-truck-003",
      "truckId": "truck-003",
      "latitude": -33.612,
      "longitude": -70.575,
      "speed": 96,
      "odometer": 188900,
      "fuelLevel": 54,
      "engineStatus": "ON",
      "lastSignalAt": "2026-05-05T11:42:00.000Z",
      "idleMinutes": 2,
      "alerts": [
        "SPEEDING",
        "ROUTE_DEVIATION"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "tire-lifecycles": [
    {
      "id": "tire-001",
      "skuId": "part-101",
      "skuCode": "NEU-TRAC-001",
      "skuName": "Neumatico traccion 295/80R22.5 nuevo",
      "purchaseOrderId": "po-004",
      "supplierId": "supplier-004",
      "supplierName": "Neumaticos Pacifico",
      "truckId": "truck-001",
      "truckPlate": "HH-RR-24",
      "brand": "Bridgestone",
      "model": "M729",
      "tireSize": "295/80R22.5",
      "tireType": "NEW",
      "usageType": "TRACTION",
      "tirePosition": "DRIVE_LEFT",
      "purchaseCost": 450000,
      "purchaseDate": "2025-08-10T10:00:00.000Z",
      "installedAt": "2025-08-15T09:00:00.000Z",
      "odometerAtInstall": 30200,
      "removedAt": "2026-04-25T16:00:00.000Z",
      "odometerAtRemoval": 280200,
      "kmUsed": 250000,
      "costPerKm": 1.8,
      "removalReason": "NORMAL_WEAR",
      "status": "REMOVED",
      "notes": "Rendimiento esperado para eje de traccion.",
      "createdAt": "2025-08-10T10:00:00.000Z",
      "updatedAt": "2026-04-25T16:00:00.000Z"
    },
    {
      "id": "tire-002",
      "skuId": "part-102",
      "skuCode": "NEU-REC-001",
      "skuName": "Neumatico traccion 295/80R22.5 recauchado",
      "purchaseOrderId": "po-005",
      "supplierId": "supplier-005",
      "supplierName": "Recauchajes Ruta Sur",
      "truckId": "truck-002",
      "truckPlate": "KL-DF-91",
      "brand": "Michelin",
      "model": "X Multi retread",
      "tireSize": "295/80R22.5",
      "tireType": "RETREADED",
      "usageType": "TRACTION",
      "tirePosition": "DRIVE_RIGHT",
      "purchaseCost": 180000,
      "purchaseDate": "2025-09-02T10:00:00.000Z",
      "installedAt": "2025-09-05T08:30:00.000Z",
      "odometerAtInstall": 88400,
      "removedAt": "2026-04-18T15:20:00.000Z",
      "odometerAtRemoval": 308400,
      "kmUsed": 220000,
      "costPerKm": 0.82,
      "removalReason": "NORMAL_WEAR",
      "status": "REMOVED",
      "notes": "Menor costo/km que neumatico nuevo comparable.",
      "createdAt": "2025-09-02T10:00:00.000Z",
      "updatedAt": "2026-04-18T15:20:00.000Z"
    },
    {
      "id": "tire-003",
      "skuId": "part-103",
      "skuCode": "NEU-DIR-002",
      "skuName": "Neumatico direccion 315/80R22.5 nuevo",
      "purchaseOrderId": "po-004",
      "supplierId": "supplier-004",
      "supplierName": "Neumaticos Pacifico",
      "truckId": "truck-003",
      "truckPlate": "PR-JK-65",
      "brand": "Goodyear",
      "model": "KMax S",
      "tireSize": "315/80R22.5",
      "tireType": "NEW",
      "usageType": "STEERING",
      "tirePosition": "FRONT_LEFT",
      "purchaseCost": 520000,
      "purchaseDate": "2025-10-01T11:00:00.000Z",
      "installedAt": "2025-10-03T09:00:00.000Z",
      "odometerAtInstall": 120400,
      "removedAt": "2026-04-30T09:00:00.000Z",
      "odometerAtRemoval": 346400,
      "kmUsed": 226000,
      "costPerKm": 2.3,
      "removalReason": "PREVENTIVE_CHANGE",
      "status": "REMOVED",
      "createdAt": "2025-10-01T11:00:00.000Z",
      "updatedAt": "2026-04-30T09:00:00.000Z"
    },
    {
      "id": "tire-004",
      "skuId": "part-104",
      "skuCode": "NEU-ARR-003",
      "skuName": "Neumatico arrastre 385/65R22.5 nuevo",
      "purchaseOrderId": "po-004",
      "supplierId": "supplier-004",
      "supplierName": "Neumaticos Pacifico",
      "truckId": "truck-004",
      "truckPlate": "VX-TT-11",
      "brand": "Continental",
      "model": "Hybrid HT3",
      "tireSize": "385/65R22.5",
      "tireType": "NEW",
      "usageType": "TRAILER",
      "tirePosition": "TRAILER_LEFT",
      "purchaseCost": 410000,
      "purchaseDate": "2025-11-11T10:00:00.000Z",
      "installedAt": "2025-11-14T10:30:00.000Z",
      "odometerAtInstall": 184000,
      "removedAt": "2026-04-12T16:00:00.000Z",
      "odometerAtRemoval": 347000,
      "kmUsed": 163000,
      "costPerKm": 2.52,
      "removalReason": "PUNCTURE",
      "status": "DISCARDED",
      "notes": "Pinchazo lateral no reparable.",
      "createdAt": "2025-11-11T10:00:00.000Z",
      "updatedAt": "2026-04-12T16:00:00.000Z"
    },
    {
      "id": "tire-005",
      "skuId": "part-105",
      "skuCode": "NEU-REC-ARR-004",
      "skuName": "Neumatico arrastre 385/65R22.5 recauchado",
      "purchaseOrderId": "po-005",
      "supplierId": "supplier-005",
      "supplierName": "Recauchajes Ruta Sur",
      "truckId": "truck-005",
      "truckPlate": "BD-FR-80",
      "brand": "Bandag",
      "model": "Trailer retread",
      "tireSize": "385/65R22.5",
      "tireType": "RETREADED",
      "usageType": "TRAILER",
      "tirePosition": "TRAILER_RIGHT",
      "purchaseCost": 165000,
      "purchaseDate": "2025-12-04T10:00:00.000Z",
      "installedAt": "2025-12-06T10:00:00.000Z",
      "odometerAtInstall": 41200,
      "removedAt": "2026-04-20T11:00:00.000Z",
      "odometerAtRemoval": 228200,
      "kmUsed": 187000,
      "costPerKm": 0.88,
      "removalReason": "RETREAD",
      "status": "RETREADED",
      "notes": "Carcasa apta para nuevo recauche.",
      "createdAt": "2025-12-04T10:00:00.000Z",
      "updatedAt": "2026-04-20T11:00:00.000Z"
    },
    {
      "id": "tire-006",
      "skuId": "part-101",
      "skuCode": "NEU-TRAC-001",
      "skuName": "Neumatico traccion 295/80R22.5 nuevo",
      "purchaseOrderId": "po-004",
      "supplierId": "supplier-004",
      "supplierName": "Neumaticos Pacifico",
      "truckId": "truck-001",
      "truckPlate": "HH-RR-24",
      "brand": "Bridgestone",
      "model": "M729",
      "tireSize": "295/80R22.5",
      "tireType": "NEW",
      "usageType": "TRACTION",
      "tirePosition": "DRIVE_INNER_LEFT",
      "purchaseCost": 450000,
      "purchaseDate": "2026-02-01T10:00:00.000Z",
      "installedAt": "2026-02-05T09:00:00.000Z",
      "odometerAtInstall": 250100,
      "status": "INSTALLED",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-05T09:00:00.000Z"
    },
    {
      "id": "tire-007",
      "skuId": "part-102",
      "skuCode": "NEU-REC-001",
      "skuName": "Neumatico traccion 295/80R22.5 recauchado",
      "purchaseOrderId": "po-005",
      "supplierId": "supplier-005",
      "supplierName": "Recauchajes Ruta Sur",
      "truckId": "truck-003",
      "truckPlate": "PR-JK-65",
      "brand": "Michelin",
      "model": "X Multi retread",
      "tireSize": "295/80R22.5",
      "tireType": "RETREADED",
      "usageType": "TRACTION",
      "tirePosition": "DRIVE_INNER_RIGHT",
      "purchaseCost": 180000,
      "purchaseDate": "2026-01-18T10:00:00.000Z",
      "installedAt": "2026-01-20T08:00:00.000Z",
      "odometerAtInstall": 188900,
      "status": "INSTALLED",
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-20T08:00:00.000Z"
    },
    {
      "id": "tire-008",
      "skuId": "part-103",
      "skuCode": "NEU-DIR-002",
      "skuName": "Neumatico direccion 315/80R22.5 nuevo",
      "purchaseOrderId": "po-004",
      "supplierId": "supplier-004",
      "supplierName": "Neumaticos Pacifico",
      "brand": "Goodyear",
      "model": "KMax S",
      "tireSize": "315/80R22.5",
      "tireType": "NEW",
      "usageType": "STEERING",
      "purchaseCost": 520000,
      "purchaseDate": "2026-03-15T10:00:00.000Z",
      "status": "IN_STOCK",
      "createdAt": "2026-03-15T10:00:00.000Z",
      "updatedAt": "2026-03-15T10:00:00.000Z"
    },
    {
      "id": "tire-009",
      "skuId": "part-105",
      "skuCode": "NEU-REC-ARR-004",
      "skuName": "Neumatico arrastre 385/65R22.5 recauchado",
      "purchaseOrderId": "po-005",
      "supplierId": "supplier-005",
      "supplierName": "Recauchajes Ruta Sur",
      "brand": "Bandag",
      "model": "Trailer retread",
      "tireSize": "385/65R22.5",
      "tireType": "RETREADED",
      "usageType": "TRAILER",
      "purchaseCost": 165000,
      "purchaseDate": "2026-03-22T10:00:00.000Z",
      "status": "IN_STOCK",
      "createdAt": "2026-03-22T10:00:00.000Z",
      "updatedAt": "2026-03-22T10:00:00.000Z"
    },
    {
      "id": "tire-010",
      "skuId": "part-101",
      "skuCode": "NEU-TRAC-001",
      "skuName": "Neumatico traccion 295/80R22.5 nuevo",
      "purchaseOrderId": "po-004",
      "supplierId": "supplier-004",
      "supplierName": "Neumaticos Pacifico",
      "truckId": "truck-002",
      "truckPlate": "KL-DF-91",
      "brand": "Bridgestone",
      "model": "M729",
      "tireSize": "295/80R22.5",
      "tireType": "NEW",
      "usageType": "TRACTION",
      "tirePosition": "DRIVE_RIGHT",
      "purchaseCost": 450000,
      "purchaseDate": "2025-06-10T10:00:00.000Z",
      "installedAt": "2025-06-12T08:00:00.000Z",
      "odometerAtInstall": 95000,
      "removedAt": "2026-01-10T15:00:00.000Z",
      "odometerAtRemoval": 210000,
      "kmUsed": 115000,
      "costPerKm": 3.91,
      "removalReason": "OPERATIONAL_DAMAGE",
      "status": "WARRANTY_CLAIM",
      "notes": "Dano operacional bajo investigacion con proveedor.",
      "createdAt": "2025-06-10T10:00:00.000Z",
      "updatedAt": "2026-01-10T15:00:00.000Z"
    },
    {
      "id": "tire-011",
      "skuId": "part-102",
      "skuCode": "NEU-REC-001",
      "skuName": "Neumatico traccion 295/80R22.5 recauchado",
      "purchaseOrderId": "po-005",
      "supplierId": "supplier-005",
      "supplierName": "Recauchajes Ruta Sur",
      "truckId": "truck-004",
      "truckPlate": "VX-TT-11",
      "brand": "Michelin",
      "model": "X Multi retread",
      "tireSize": "295/80R22.5",
      "tireType": "RETREADED",
      "usageType": "TRACTION",
      "tirePosition": "DRIVE_LEFT",
      "purchaseCost": 180000,
      "purchaseDate": "2025-10-20T10:00:00.000Z",
      "installedAt": "2025-10-23T08:30:00.000Z",
      "odometerAtInstall": 190000,
      "removedAt": "2026-03-28T15:30:00.000Z",
      "odometerAtRemoval": 386000,
      "kmUsed": 196000,
      "costPerKm": 0.92,
      "removalReason": "NORMAL_WEAR",
      "status": "REMOVED",
      "notes": "Recauchado de traccion con buena rentabilidad por kilometro.",
      "createdAt": "2025-10-20T10:00:00.000Z",
      "updatedAt": "2026-03-28T15:30:00.000Z"
    }
  ],
  "arrival-checklists": [
    {
      "id": "arrival-001",
      "freightId": "freight-request-004",
      "truckId": "truck-005",
      "driverId": "driver-001",
      "arrivalAt": "2026-05-05T15:20:00.000Z",
      "odometerEnd": 94305,
      "fuelLevelEnd": 61,
      "newDamages": false,
      "cargoStatus": "Entregada conforme",
      "receiverName": "Camila Rojas",
      "receiverSignatureUrl": "/mock/signature-001.png",
      "photos": [
        "/mock/arrival-bdfr80-1.jpg"
      ],
      "status": "COMPLETED",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "departure-checklists": [
    {
      "id": "departure-001",
      "freightId": "freight-request-004",
      "truckId": "truck-005",
      "driverId": "driver-001",
      "departureAt": "2026-05-05T09:10:00.000Z",
      "odometerStart": 94120,
      "fuelLevelStart": 92,
      "tiresOk": true,
      "lightsOk": true,
      "brakesOk": true,
      "oilOk": true,
      "waterOk": true,
      "documentsOk": true,
      "cargoSecured": true,
      "photos": [
        "/mock/departure-bdfr80-1.jpg"
      ],
      "observations": "Temperatura validada antes de salida.",
      "status": "COMPLETED",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "departure-002",
      "freightId": "freight-request-001",
      "truckId": "truck-002",
      "driverId": "driver-002",
      "departureAt": "2026-05-05T12:00:00.000Z",
      "odometerStart": 319440,
      "fuelLevelStart": 65,
      "tiresOk": true,
      "lightsOk": true,
      "brakesOk": true,
      "oilOk": true,
      "waterOk": true,
      "documentsOk": false,
      "cargoSecured": true,
      "photos": [],
      "observations": "Revision tecnica vencida, salida bloqueada.",
      "status": "BLOCKED",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "truck-costs": [
    {
      "id": "cost-001",
      "truckId": "truck-001",
      "costType": "PARTS",
      "description": "Sensor NOx sistema emisiones",
      "amount": 680000,
      "date": "2026-05-03T10:00:00.000Z",
      "relatedEntityType": "workshop-case",
      "relatedEntityId": "case-001",
      "odometer": 284100,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "cost-002",
      "truckId": "truck-002",
      "costType": "FINE",
      "description": "Multa por documentacion vencida",
      "amount": 145000,
      "date": "2026-05-01T12:00:00.000Z",
      "relatedEntityType": "incident",
      "relatedEntityId": "incident-002",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "cost-003",
      "truckId": "truck-004",
      "costType": "FUEL",
      "description": "Combustible ruta Los Andes",
      "amount": 244200,
      "date": "2026-05-03T17:00:00.000Z",
      "relatedEntityType": "fuel",
      "relatedEntityId": "fuel-002",
      "odometer": 401230,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "cost-004",
      "truckId": "truck-005",
      "costType": "TIRES",
      "description": "Rotacion neumaticos refrigerado",
      "amount": 62000,
      "date": "2026-04-29T08:00:00.000Z",
      "relatedEntityType": "tire-performance",
      "relatedEntityId": "tire-005",
      "odometer": 94120,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "cost-005",
      "truckId": "truck-003",
      "costType": "LABOR",
      "description": "Diagnostico electrico",
      "amount": 180000,
      "date": "2026-05-04T15:00:00.000Z",
      "relatedEntityType": "workshop-case",
      "relatedEntityId": "case-003",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "truck-cost-summaries": [
    {
      "truckId": "truck-001",
      "monthlyCost": 3120000,
      "costPerKm": 1850,
      "freightCostAverage": 760000,
      "workshopCost": 1490000,
      "profitabilityStatus": "WATCH",
      "id": "truck-cost-summary-truck-001",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "truckId": "truck-002",
      "monthlyCost": 4250000,
      "costPerKm": 2550,
      "freightCostAverage": 980000,
      "workshopCost": 1610000,
      "profitabilityStatus": "EXPENSIVE",
      "id": "truck-cost-summary-truck-002",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "truckId": "truck-005",
      "monthlyCost": 1980000,
      "costPerKm": 1180,
      "freightCostAverage": 520000,
      "workshopCost": 260000,
      "profitabilityStatus": "PROFITABLE",
      "id": "truck-cost-summary-truck-005",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "truck-documents": [
    {
      "id": "doc-001",
      "truckId": "truck-001",
      "documentType": "CIRCULATION_PERMIT",
      "documentNumber": "PC-2026-HHRR24",
      "issuedAt": "2026-03-01T10:00:00.000Z",
      "expiresAt": "2027-03-31T23:59:00.000Z",
      "status": "VALID",
      "attachmentUrl": "/mock/permiso-hhrr24.pdf",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "doc-002",
      "truckId": "truck-002",
      "documentType": "TECHNICAL_INSPECTION",
      "documentNumber": "RT-2025-KLDF91",
      "issuedAt": "2025-04-20T10:00:00.000Z",
      "expiresAt": "2026-04-20T23:59:00.000Z",
      "status": "EXPIRED",
      "attachmentUrl": "/mock/revision-kldf91.pdf",
      "notes": "Bloquea disponibilidad de flota.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "doc-003",
      "truckId": "truck-003",
      "documentType": "MANDATORY_INSURANCE",
      "documentNumber": "SOAP-PRJK65",
      "issuedAt": "2026-03-10T10:00:00.000Z",
      "expiresAt": "2026-05-18T23:59:00.000Z",
      "status": "EXPIRES_SOON_15",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "doc-004",
      "truckId": "truck-004",
      "documentType": "ADDITIONAL_INSURANCE",
      "documentNumber": "SEG-VXTT11",
      "issuedAt": "2025-12-01T10:00:00.000Z",
      "expiresAt": "2026-06-02T23:59:00.000Z",
      "status": "EXPIRES_SOON_30",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "doc-005",
      "truckId": "truck-005",
      "documentType": "TECHNICAL_INSPECTION",
      "documentNumber": "RT-2026-BDFR80",
      "issuedAt": "2026-04-12T10:00:00.000Z",
      "expiresAt": "2027-04-12T23:59:00.000Z",
      "status": "VALID",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "doc-006",
      "truckId": "truck-003",
      "documentType": "LEASING_CONTRACT",
      "status": "MISSING",
      "notes": "Contrato no cargado en sistema.",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "truck-health-scores": [
    {
      "truckId": "truck-005",
      "score": 92,
      "status": "HEALTHY",
      "deductions": [
        {
          "label": "Mantencion preventiva cercana",
          "points": 8
        }
      ],
      "summary": "Unidad rentable y disponible para fletes refrigerados.",
      "id": "truck-health-score-truck-005",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "truckId": "truck-004",
      "score": 78,
      "status": "WARNING",
      "deductions": [
        {
          "label": "Costo/km sobre promedio",
          "points": 10
        },
        {
          "label": "Rendimiento combustible bajo",
          "points": 12
        }
      ],
      "summary": "Operativo, pero conviene revisar consumo y costo por ruta.",
      "id": "truck-health-score-truck-004",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "truckId": "truck-003",
      "score": 67,
      "status": "RISK",
      "deductions": [
        {
          "label": "En taller",
          "points": 15
        },
        {
          "label": "Fallas recurrentes ultimos 60 dias",
          "points": 15
        },
        {
          "label": "Mantencion critica cercana",
          "points": 3
        }
      ],
      "summary": "Riesgo medio por recurrencia de fallas electricas.",
      "id": "truck-health-score-truck-003",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "truckId": "truck-001",
      "score": 58,
      "status": "RISK",
      "deductions": [
        {
          "label": "Esperando repuesto critico",
          "points": 20
        },
        {
          "label": "SLA de taller en riesgo",
          "points": 12
        },
        {
          "label": "Alto costo por km",
          "points": 10
        }
      ],
      "summary": "No asignar hasta cerrar caso de taller y validar repuesto.",
      "id": "truck-health-score-truck-001",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "truckId": "truck-002",
      "score": 35,
      "status": "CRITICAL",
      "deductions": [
        {
          "label": "Documento vencido",
          "points": 20
        },
        {
          "label": "Incidente critico abierto",
          "points": 25
        },
        {
          "label": "Bajo rendimiento combustible",
          "points": 10
        },
        {
          "label": "Alto costo por km",
          "points": 10
        }
      ],
      "summary": "Bloqueado para operacion hasta regularizar riesgo documental y seguridad.",
      "id": "truck-health-score-truck-002",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "truck-timeline-events": [
    {
      "id": "timeline-001",
      "truckId": "truck-001",
      "eventType": "PURCHASE",
      "title": "Ingreso a flota",
      "description": "Camion comprado e incorporado a rutas norte.",
      "relatedEntityType": "purchase",
      "relatedEntityId": "asset-001",
      "eventDate": "2021-07-10T10:00:00.000Z",
      "createdBy": "Administracion",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "timeline-002",
      "truckId": "truck-001",
      "eventType": "TIRE_CHANGE",
      "title": "Instalacion neumaticos traccion",
      "description": "Instalacion de NEU-TRAC-001 con odometro 250.100 km.",
      "relatedEntityType": "tire",
      "relatedEntityId": "tire-006",
      "eventDate": "2026-02-05T09:00:00.000Z",
      "createdBy": "Bodega",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "timeline-003",
      "truckId": "truck-001",
      "eventType": "BREAKDOWN",
      "title": "Falla sistema emisiones",
      "description": "Caso de taller bloqueado por repuesto critico.",
      "relatedEntityType": "case",
      "relatedEntityId": "case-001",
      "eventDate": "2026-05-03T11:00:00.000Z",
      "createdBy": "Recepcion",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "timeline-004",
      "truckId": "truck-002",
      "eventType": "DOCUMENT",
      "title": "Revision tecnica vencida",
      "description": "Documento obligatorio vencido, unidad no disponible para flete.",
      "relatedEntityType": "document",
      "relatedEntityId": "doc-002",
      "eventDate": "2026-05-01T08:00:00.000Z",
      "createdBy": "Backoffice",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "timeline-005",
      "truckId": "truck-004",
      "eventType": "FREIGHT_DONE",
      "title": "Flete plataforma terminado",
      "description": "Ruta Santiago - Los Andes con margen operativo positivo.",
      "relatedEntityType": "freight",
      "relatedEntityId": "freight-request-001",
      "eventDate": "2026-05-04T18:00:00.000Z",
      "createdBy": "Operaciones",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "timeline-006",
      "truckId": "truck-005",
      "eventType": "DEPARTURE_CHECKLIST",
      "title": "Checklist salida refrigerado",
      "description": "Unidad aprobada para flete refrigerado con documentos al dia.",
      "relatedEntityType": "checklist",
      "relatedEntityId": "departure-001",
      "eventDate": "2026-05-05T09:10:00.000Z",
      "createdBy": "Luis Herrera",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "trucks": [
    {
      "id": "truck-001",
      "plate": "HH-RR-24",
      "brand": "Volvo",
      "model": "FH 540",
      "year": 2021,
      "odometer": 284100,
      "status": "in-workshop",
      "vin": "YV2RT60A0MB912345",
      "lastServiceAt": "2026-04-12T10:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "truck-002",
      "plate": "KL-DF-91",
      "brand": "Scania",
      "model": "R 450",
      "year": 2020,
      "odometer": 319440,
      "status": "blocked",
      "vin": "YS2R4X200L2176543",
      "lastServiceAt": "2026-03-28T15:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "truck-003",
      "plate": "PR-JK-65",
      "brand": "Mercedes-Benz",
      "model": "Actros 2645",
      "year": 2022,
      "odometer": 188900,
      "status": "in-workshop",
      "vin": "WDB96340310234567",
      "lastServiceAt": "2026-04-24T09:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "truck-004",
      "plate": "VX-TT-11",
      "brand": "MAN",
      "model": "TGX 26.480",
      "year": 2019,
      "odometer": 401230,
      "status": "in-workshop",
      "vin": "WMA06XZZ8KP123456",
      "lastServiceAt": "2026-04-02T12:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "truck-005",
      "plate": "BD-FR-80",
      "brand": "Volvo",
      "model": "FM 460 Refrigerado",
      "year": 2023,
      "odometer": 94120,
      "status": "available",
      "vin": "YV2XTY0A0PB778899",
      "lastServiceAt": "2026-04-29T08:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "user-role-assignments": [
    {
      "id": "user-role-user-001",
      "userId": "user-001",
      "userName": "Andrea Molina",
      "email": "andrea@taller.local",
      "roleCode": "ADMIN",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-002",
      "userId": "user-002",
      "userName": "Javier Torres",
      "email": "javier@taller.local",
      "roleCode": "JEFE_TALLER",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-003",
      "userId": "user-003",
      "userName": "Natalia Perez",
      "email": "natalia@taller.local",
      "roleCode": "ENCARGADO_BODEGA",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-004",
      "userId": "user-004",
      "userName": "Felipe Araya",
      "email": "felipe@taller.local",
      "roleCode": "COMPRAS",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-005",
      "userId": "user-005",
      "userName": "Daniel Rivas",
      "email": "daniel@taller.local",
      "roleCode": "MECANICO",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-006",
      "userId": "user-006",
      "userName": "Paula Fuentes",
      "email": "paula@taller.local",
      "roleCode": "MECANICO",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-007",
      "userId": "user-007",
      "userName": "Marco Silva",
      "email": "marco@taller.local",
      "roleCode": "MECANICO",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "user-role-user-008",
      "userId": "user-008",
      "userName": "Camila Herrera",
      "email": "camila@taller.local",
      "roleCode": "MECANICO",
      "isActive": true,
      "passwordHash": "pbkdf2-sha256$210000$truck-workshop-dev$3U-e7YzJ6hv9dqURDvjHuWh1IYjePGhumCRKcD7TaDI",
      "passwordUpdatedAt": "2026-05-13T00:00:00.000Z",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "waiting-queue": [
    {
      "id": "queue-001",
      "caseId": "case-003",
      "caseNumber": "TW-2026-003",
      "customerName": "Flota interna",
      "priority": "medium",
      "truckPlate": "PR-JK-65",
      "slaStatus": "OK",
      "hasPartsBlock": false,
      "requestedAt": "2026-05-05T11:10:00.000Z",
      "reason": "Esperando disponibilidad de estacion de diagnostico",
      "estimatedHours": 3,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "queue-002",
      "caseId": "case-001",
      "caseNumber": "TW-2026-001",
      "customerName": "Flota interna",
      "priority": "high",
      "truckPlate": "HH-RR-24",
      "slaStatus": "AT_RISK",
      "hasPartsBlock": true,
      "requestedAt": "2026-05-05T10:45:00.000Z",
      "reason": "Requiere confirmacion de repuesto antes de reparar",
      "estimatedHours": 4,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "queue-003",
      "caseId": "case-004",
      "caseNumber": "TW-2026-004",
      "customerName": "Flota interna",
      "priority": "critical",
      "truckPlate": "VX-TT-11",
      "slaStatus": "BREACHED",
      "hasPartsBlock": false,
      "requestedAt": "2026-05-05T12:15:00.000Z",
      "reason": "Debe pasar por prueba final antes de entrega",
      "estimatedHours": 2,
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "warehouse-locations": [
    {
      "id": "loc-001",
      "code": "A-01-01",
      "name": "Motor alta rotacion",
      "zone": "A",
      "aisle": "01",
      "shelf": "01",
      "level": "Medio",
      "capacity": 120,
      "status": "active",
      "createdAt": "2026-04-01T10:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-01T12:30:00.000Z",
      "updatedBy": "Admin Taller"
    },
    {
      "id": "loc-002",
      "code": "B-03-02",
      "name": "Frenos y aire",
      "zone": "B",
      "aisle": "03",
      "shelf": "02",
      "level": "Bajo",
      "capacity": 80,
      "status": "active",
      "createdAt": "2026-04-02T11:00:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-02T09:15:00.000Z",
      "updatedBy": "Natalia Perez"
    },
    {
      "id": "loc-003",
      "code": "C-02-04",
      "name": "Suspension pesada",
      "zone": "C",
      "aisle": "02",
      "shelf": "04",
      "level": "Alto",
      "capacity": 90,
      "status": "full",
      "createdAt": "2026-04-03T09:45:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-03T14:20:00.000Z",
      "updatedBy": "Oscar Valdes"
    },
    {
      "id": "loc-004",
      "code": "D-01-01",
      "name": "Transmision critica",
      "zone": "D",
      "aisle": "01",
      "shelf": "01",
      "level": "Bajo",
      "capacity": 40,
      "status": "maintenance",
      "createdAt": "2026-04-04T15:10:00.000Z",
      "createdBy": "Bodega",
      "updatedAt": "2026-05-04T08:40:00.000Z",
      "updatedBy": "Admin Taller"
    }
  ],
  "warehouse-managers": [
    {
      "id": "warehouse-manager-001",
      "name": "Natalia Perez",
      "phone": "+56 9 5531 1100",
      "shift": "08:00 - 17:00",
      "activeCases": 3,
      "assignedLocationIds": [
        "loc-001",
        "loc-002"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "warehouse-manager-002",
      "name": "Oscar Valdes",
      "phone": "+56 9 7731 4499",
      "shift": "12:00 - 21:00",
      "activeCases": 2,
      "assignedLocationIds": [
        "loc-003",
        "loc-004"
      ],
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "warehouse-movements": [
    {
      "id": "mov-001",
      "partSku": "FLT-9001",
      "partName": "Filtro combustible alto flujo",
      "type": "salida",
      "quantity": 2,
      "locationCode": "A-01-01",
      "relatedCaseId": "case-001",
      "createdAt": "2026-05-05T09:25:00.000Z",
      "createdBy": "Natalia Perez",
      "updatedAt": "2026-05-05T09:25:00.000Z"
    },
    {
      "id": "mov-002",
      "partSku": "BRK-2210",
      "partName": "Valvula moduladora freno",
      "type": "ajuste",
      "quantity": -1,
      "locationCode": "B-03-02",
      "createdAt": "2026-05-04T16:10:00.000Z",
      "createdBy": "Oscar Valdes",
      "updatedAt": "2026-05-04T16:10:00.000Z"
    },
    {
      "id": "mov-003",
      "partSku": "SUS-1188",
      "partName": "Buje barra estabilizadora",
      "type": "entrada",
      "quantity": 8,
      "locationCode": "C-02-04",
      "createdAt": "2026-05-03T12:35:00.000Z",
      "createdBy": "Natalia Perez",
      "updatedAt": "2026-05-03T12:35:00.000Z"
    }
  ],
  "warehouse-stock": [
    {
      "partId": "part-001",
      "sku": "FLT-9001",
      "name": "Filtro combustible alto flujo",
      "quantity": 12,
      "locationId": "loc-001",
      "locationCode": "A-01-01",
      "minStock": 6,
      "status": "available",
      "id": "warehouse-stock-part-001",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "partId": "part-002",
      "sku": "BRK-2210",
      "name": "Valvula moduladora freno",
      "quantity": 2,
      "locationId": "loc-002",
      "locationCode": "B-03-02",
      "minStock": 4,
      "status": "low-stock",
      "id": "warehouse-stock-part-002",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "partId": "part-003",
      "sku": "SUS-1188",
      "name": "Buje barra estabilizadora",
      "quantity": 18,
      "locationId": "loc-003",
      "locationCode": "C-02-04",
      "minStock": 10,
      "status": "available",
      "id": "warehouse-stock-part-003",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "partId": "part-004",
      "sku": "TRN-7844",
      "name": "Kit embrague pesado",
      "quantity": 0,
      "locationId": "loc-004",
      "locationCode": "D-01-01",
      "minStock": 2,
      "status": "out-of-stock",
      "id": "warehouse-stock-part-004",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "workshop-bays": [
    {
      "id": "bay-001",
      "name": "Estacion 1 motor",
      "type": "mechanical",
      "status": "occupied",
      "currentCaseId": "case-001",
      "currentCaseNumber": "TW-2026-001",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "bay-002",
      "name": "Estacion 2 frenos",
      "type": "mechanical",
      "status": "occupied",
      "currentCaseId": "case-002",
      "currentCaseNumber": "TW-2026-002",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "bay-003",
      "name": "Diagnostico rapido",
      "type": "diagnostic",
      "status": "available",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "bay-004",
      "name": "Electrica avanzada",
      "type": "electrical",
      "status": "maintenance",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    },
    {
      "id": "bay-005",
      "name": "Prueba final",
      "type": "test",
      "status": "occupied",
      "currentCaseId": "case-004",
      "currentCaseNumber": "TW-2026-004",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:00.000Z"
    }
  ],
  "workshop-cases": [
    {
      "id": "case-001",
      "caseNumber": "TW-2026-001",
      "code": "TW-2026-001",
      "truckId": "truck-001",
      "truckPlate": "HH-RR-24",
      "driverId": "driver-001",
      "driverName": "Luis Herrera",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "customer": "Ruta Norte SpA",
      "failureDescription": "Perdida de potencia en subida y consumo irregular.",
      "title": "Perdida de potencia en subida",
      "status": "diagnosis",
      "priority": "high",
      "assignedMechanicId": "mechanic-001",
      "mechanicId": "mechanic-001",
      "mechanicName": "Daniel Rivas",
      "warehouseManagerId": "warehouse-manager-001",
      "warehouseManagerName": "Natalia Perez",
      "slaId": "sla-high",
      "slaDueAt": "2026-05-05T22:00:00.000Z",
      "slaStatus": "OK",
      "escalationLevel": "LEVEL_0_NORMAL",
      "requiredParts": [
        {
          "partId": "part-001",
          "sku": "FLT-9001",
          "name": "Filtro combustible alto flujo",
          "quantity": 2,
          "stockAvailable": 12,
          "status": "available",
          "requiresPurchase": false
        },
        {
          "partId": "part-002",
          "sku": "BRK-2210",
          "name": "Valvula moduladora freno",
          "quantity": 1,
          "stockAvailable": 2,
          "status": "purchase_required",
          "requiresPurchase": true,
          "purchaseRequestId": "prq-001"
        }
      ],
      "purchaseRequestIds": [
        "prq-001"
      ],
      "createdAt": "2026-05-02T09:30:00.000Z",
      "updatedAt": "2026-05-05T10:30:00.000Z",
      "estimatedDeliveryAt": "2026-05-06T18:00:00.000Z",
      "estimatedCost": 680000,
      "currentStep": "Diagnosticar problema"
    },
    {
      "id": "case-002",
      "caseNumber": "TW-2026-002",
      "code": "TW-2026-002",
      "truckId": "truck-002",
      "truckPlate": "KL-DF-91",
      "driverId": "driver-002",
      "driverName": "Marcela Soto",
      "customerId": "customer-maipo",
      "customerName": "Transportes Maipo",
      "customer": "Transportes Maipo",
      "failureDescription": "Fuga de aire en sistema de frenos con perdida rapida de presion.",
      "title": "Fuga de aire en sistema de frenos",
      "status": "repairing",
      "priority": "critical",
      "assignedMechanicId": "mechanic-002",
      "mechanicId": "mechanic-002",
      "mechanicName": "Paula Fuentes",
      "warehouseManagerId": "warehouse-manager-001",
      "warehouseManagerName": "Natalia Perez",
      "slaId": "sla-critical",
      "slaDueAt": "2026-05-05T10:00:00.000Z",
      "slaStatus": "BREACHED",
      "escalationLevel": "LEVEL_2_JEFE_TALLER",
      "escalationReason": "CRITICAL_PART_MISSING",
      "requiredParts": [
        {
          "partId": "part-002",
          "sku": "BRK-2210",
          "name": "Valvula moduladora freno",
          "quantity": 2,
          "stockAvailable": 0,
          "status": "po_created",
          "requiresPurchase": true,
          "purchaseRequestId": "prq-002",
          "purchaseOrderId": "po-001"
        }
      ],
      "purchaseRequestIds": [
        "prq-002"
      ],
      "createdAt": "2026-05-03T13:10:00.000Z",
      "updatedAt": "2026-05-05T09:20:00.000Z",
      "estimatedDeliveryAt": "2026-05-05T20:00:00.000Z",
      "estimatedCost": 920000,
      "currentStep": "Ejecutar reparacion"
    },
    {
      "id": "case-003",
      "caseNumber": "TW-2026-003",
      "code": "TW-2026-003",
      "truckId": "truck-003",
      "truckPlate": "PR-JK-65",
      "driverId": "driver-003",
      "driverName": "Rodrigo Pavez",
      "customerId": "customer-minerales-sur",
      "customerName": "Minerales del Sur",
      "customer": "Minerales del Sur",
      "failureDescription": "Revision por vibracion de tren delantero a velocidad media.",
      "title": "Revision por vibracion de tren delantero",
      "status": "assigned",
      "priority": "medium",
      "assignedMechanicId": "mechanic-003",
      "mechanicId": "mechanic-003",
      "mechanicName": "Marco Silva",
      "warehouseManagerId": "warehouse-manager-002",
      "warehouseManagerName": "Oscar Valdes",
      "slaId": "sla-medium",
      "slaDueAt": "2026-05-07T14:00:00.000Z",
      "slaStatus": "OK",
      "escalationLevel": "LEVEL_0_NORMAL",
      "requiredParts": [
        {
          "partId": "part-003",
          "sku": "SUS-1188",
          "name": "Buje barra estabilizadora",
          "quantity": 4,
          "stockAvailable": 18,
          "status": "available",
          "requiresPurchase": false
        }
      ],
      "purchaseRequestIds": [],
      "createdAt": "2026-05-04T08:45:00.000Z",
      "updatedAt": "2026-05-04T16:15:00.000Z",
      "estimatedDeliveryAt": "2026-05-07T14:00:00.000Z",
      "estimatedCost": 430000,
      "currentStep": "Asignar responsable"
    },
    {
      "id": "case-004",
      "caseNumber": "TW-2026-004",
      "code": "TW-2026-004",
      "truckId": "truck-004",
      "truckPlate": "VX-TT-11",
      "driverId": "driver-004",
      "driverName": "Claudio Munoz",
      "customerId": "customer-ruta-norte",
      "customerName": "Ruta Norte SpA",
      "customer": "Ruta Norte SpA",
      "failureDescription": "Prueba final posterior a cambio de embrague con kit pendiente de recepcion.",
      "title": "Prueba final posterior a cambio de embrague",
      "status": "testing",
      "priority": "medium",
      "assignedMechanicId": "mechanic-004",
      "mechanicId": "mechanic-004",
      "mechanicName": "Camila Herrera",
      "warehouseManagerId": "warehouse-manager-002",
      "warehouseManagerName": "Oscar Valdes",
      "slaId": "sla-medium",
      "slaDueAt": "2026-05-05T16:00:00.000Z",
      "slaStatus": "AT_RISK",
      "escalationLevel": "LEVEL_1_SUPERVISOR",
      "escalationReason": "CUSTOMER_COMPLAINT",
      "requiredParts": [
        {
          "partId": "part-004",
          "sku": "TRN-7844",
          "name": "Kit embrague pesado",
          "quantity": 1,
          "stockAvailable": 0,
          "status": "waiting_reception",
          "requiresPurchase": true,
          "purchaseRequestId": "prq-003",
          "purchaseOrderId": "po-002"
        }
      ],
      "purchaseRequestIds": [
        "prq-003"
      ],
      "createdAt": "2026-04-30T11:15:00.000Z",
      "updatedAt": "2026-05-05T08:45:00.000Z",
      "estimatedDeliveryAt": "2026-05-05T16:00:00.000Z",
      "estimatedCost": 1250000,
      "currentStep": "Probar camion"
    }
  ]
}
