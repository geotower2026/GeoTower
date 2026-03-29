const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Criar notificação para usuários específicos
  static async createNotification({
    title,
    message,
    type = 'info',
    priority = 'medium',
    recipientRoles = ['admin', 'manager'],
    senderId,
    senderName,
    relatedEntity,
    metadata = {},
    city = 'manaus',
    expiresAt
  }) {
    try {
      // Buscar usuários com os roles especificados
      const recipients = await User.find({
        role: { $in: recipientRoles },
        isActive: { $ne: false }
      }).select('_id role city');

      if (recipients.length === 0) {
        console.log('Nenhum usuário encontrado para receber notificação:', recipientRoles);
        return [];
      }

      // Filtrar recipients por cidade se necessário
      let filteredRecipients = recipients;
      if (city !== 'both') {
        filteredRecipients = recipients.filter(user => {
          const userCity = user.city || 'manaus';
          return userCity === 'both' || userCity === city;
        });
      }

      if (filteredRecipients.length === 0) {
        console.log('Nenhum usuário elegível encontrado para cidade:', city);
        return [];
      }

      // Criar notificações para cada recipient
      const notifications = filteredRecipients.map(recipient => ({
        title,
        message,
        type,
        priority,
        recipientId: recipient._id,
        recipientRole: recipient.role,
        senderId,
        senderName,
        relatedEntity,
        metadata,
        city,
        expiresAt
      }));

      const createdNotifications = await Notification.insertMany(notifications);
      console.log(`✅ Criadas ${createdNotifications.length} notificações: ${title}`);

      return createdNotifications;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Criar notificação para agendamento solicitado
  static async notifyScheduleRequest(deliveryId, driverName, containerNumber, city = 'manaus') {
    return this.createNotification({
      title: 'Solicitação de Agendamento',
      message: `${driverName} solicitou agendamento de devolução para o container ${containerNumber}`,
      type: 'info',
      priority: 'medium',
      recipientRoles: ['admin', 'manager'],
      relatedEntity: {
        type: 'delivery',
        id: deliveryId,
        number: containerNumber
      },
      metadata: {
        action: 'schedule_request',
        driverName,
        containerNumber
      },
      city
    });
  }

  // Criar notificação para canhotos retidos
  static async notifyCanhotoRetido(deliveryId, containerNumber, observations, city = 'manaus') {
    return this.createNotification({
      title: 'Canhoto Retido',
      message: `Container ${containerNumber} finalizado com canhotos retidos. Observações: ${observations}`,
      type: 'warning',
      priority: 'high',
      recipientRoles: ['admin', 'manager'],
      relatedEntity: {
        type: 'delivery',
        id: deliveryId,
        number: containerNumber
      },
      metadata: {
        action: 'canhoto_retido',
        containerNumber,
        observations
      },
      city
    });
  }

  // Buscar notificações de um usuário
  static async getUserNotifications(userId, options = {}) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    const query = { recipientId: userId };
    if (unreadOnly) {
      query.read = false;
    }

    return Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('senderId', 'name username')
      .lean();
  }

  // Contar notificações não lidas
  static async countUnreadNotifications(userId) {
    return Notification.countDocuments({
      recipientId: userId,
      read: false
    });
  }

  // Marcar notificação como lida
  static async markAsRead(notificationId, userId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
  }

  // Marcar todas como lidas para um usuário
  static async markAllAsRead(userId) {
    return Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true, readAt: new Date() }
    );
  }

  // Limpar notificações antigas (mais de 30 dias)
  static async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });

    console.log(`🧹 Limpeza: ${result.deletedCount} notificações antigas removidas`);
    return result;
  }
}

module.exports = NotificationService;