// application/use-cases/production/GetCalendarioProduction.js

class GetCalendarioProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  /**
   * Devuelve eventos para el calendario.
   * Cada orden activa genera hasta 2 eventos:
   *   1. Evento de estado actual (color según estado del flujo)
   *   2. Evento de fecha de entrega (marcador de deadline)
   *
   * @param {string} desde  — ISO yyyy-mm-dd  (opcional)
   * @param {string} hasta  — ISO yyyy-mm-dd  (opcional)
   */
  async execute(desde, hasta) {
    const ordenes = await this.productionRepository.findParaCalendario(desde, hasta);

    const COLORES_ESTADO = {
      'Diseño':        { color: '#7c3aed', tipo: 'diseno'     },
      'Ficha Técnica': { color: '#7c3aed', tipo: 'diseno'     },
      'Corte':         { color: '#0891b2', tipo: 'corte'      },
      'Compras':       { color: '#d97706', tipo: 'calidad'    },
      'Producción':    { color: '#ec4899', tipo: 'produccion' },
    };

    const eventos = [];

    ordenes.forEach((orden) => {
      const colorInfo = COLORES_ESTADO[orden.estado] || { color: '#6366f1', tipo: 'creacion' };

      // Evento de estado actual
      eventos.push({
        id:           `estado-${orden.id}`,
        title:        `#${orden.numero_orden} ${orden.cliente} — ${orden.estado}`,
        date:         orden.ultimo_cambio?.fecha
          ? new Date(orden.ultimo_cambio.fecha).toISOString().split('T')[0]
          : new Date(orden.fecha_entrega).toISOString().split('T')[0],
        tipo:         colorInfo.tipo,
        color:        colorInfo.color,
        orderId:      orden.id,
        numero_orden: orden.numero_orden,
        estado:       orden.estado,
        cliente:      orden.cliente,
      });

      // Evento de fecha de entrega (deadline)
      eventos.push({
        id:           `entrega-${orden.id}`,
        title:        ` Entrega #${orden.numero_orden} — ${orden.cliente}`,
        date:         new Date(orden.fecha_entrega).toISOString().split('T')[0],
        tipo:         'entrega',
        color:        '#16a34a',
        orderId:      orden.id,
        numero_orden: orden.numero_orden,
        estado:       orden.estado,
        cliente:      orden.cliente,
      });
    });

    return eventos;
  }
}

module.exports = GetCalendarioProduction;
