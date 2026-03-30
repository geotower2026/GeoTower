const mongoose = require("mongoose");

/**
 * DeliveryVerification.js
 * Rastreia quando um arquivo de entrega foi marcado como verificado/importado para Icompany
 * Permite sincronização em tempo real entre múltiplos usuários/navegadores
 */

const DeliveryVerificationSchema = new mongoose.Schema(
  {
    // ID da entrega sendo verificada
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      required: true,
      index: true
    },

    // Número da entrega (para referência rápida)
    deliveryNumber: {
      type: String,
      default: ""
    },

    // Status de verificação
    verified: {
      type: Boolean,
      default: false,
      index: true
    },

    // Usuário que marcou como verificado
    verifiedBy: {
      type: String,
      default: ""
    },

    // Quando foi marcado como verificado
    verifiedAt: {
      type: Date,
      default: null
    },

    // Cidade para isolamento de dados
    cityCode: {
      type: String,
      default: "manaus",
      index: true
    },

    // Observações/motivos da verificação
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Índice composto para buscas eficientes
DeliveryVerificationSchema.index({ deliveryId: 1, cityCode: 1 });
DeliveryVerificationSchema.index({ verified: 1, cityCode: 1 });
DeliveryVerificationSchema.index({ verifiedAt: -1, cityCode: 1 });

module.exports = mongoose.model("DeliveryVerification", DeliveryVerificationSchema);
