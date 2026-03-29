const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    // Usuário que receberá a notificação
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientRole: { type: String, required: true }, // 'admin', 'manager', etc.

    // Usuário que gerou a notificação
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderName: { type: String },

    // Entidade relacionada (delivery, programacao, etc.)
    relatedEntity: {
      type: { type: String, enum: ['delivery', 'programacao', 'user'] },
      id: { type: mongoose.Schema.Types.ObjectId },
      number: { type: String } // container number, etc.
    },

    // Dados específicos da notificação
    metadata: { type: mongoose.Schema.Types.Mixed },

    // Status da notificação
    read: { type: Boolean, default: false },
    readAt: { type: Date },

    // Cidade relacionada
    city: { type: String, default: 'manaus' },

    // Expiração (opcional)
    expiresAt: { type: Date }
  },
  {
    timestamps: true
  }
);

// Índices para performance
NotificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ city: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método para marcar como lida
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Notification", NotificationSchema);