// application/use-cases/production/GetAlertasProduction.js

class GetAlertasProduction {
  constructor(productionRepository) {
    this.productionRepository = productionRepository;
  }

  /**
   * Devuelve tres grupos de alertas:
   *
   *   vencidas        — fecha_entrega ya pasó y la orden no está anulada
   *   proximas_vencer — vencen en los próximos 3 días
   *   en_espera_larga — llevan más de 7 días en el mismo estado sin avanzar
   *
   * El frontend (ProductionAlerts.jsx) usa estos datos para mostrar
   * los distintos tipos de alerta en el modal.
   */
  async execute() {
    const alertas = await this.productionRepository.findAlertas();
    return alertas;
  }
}

module.exports = GetAlertasProduction;
