// application/use-cases/purchases/AnularPurchase.js

class AnularPurchase {
    constructor(purchaseRepository) {
        this.purchaseRepository = purchaseRepository;
    }

    async execute(id, motivo) {
        const purchase = await this.purchaseRepository.findById(id);

        if (!purchase) {
            const error = new Error("Compra no encontrada");
            error.statusCode = 404;
            throw error;
        }

        if (purchase.estaAnulada()) {
            const error = new Error("La compra ya se encuentra anulada");
            error.statusCode = 422;
            throw error;
        }

        if (!motivo || !motivo.trim()) {
            const error = new Error("El motivo de anulación es requerido");
            error.statusCode = 400;
            throw error;
        }

        const updated = await this.purchaseRepository.anular(id, motivo.trim());
        return updated.toPublic();
    }
}

module.exports = AnularPurchase;