import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCheckCircle, FaTrash, FaBell } from 'react-icons/fa';
import { notificationService } from '../services/authService';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  // Fechar o painel quando clica fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        event.target.closest('[aria-label="Notificações"]') === null
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Buscar notificações
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar como lido
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Atualizar lista
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  // Deletar notificação
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Remover da lista
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-200 text-red-800',
      medium: 'bg-yellow-200 text-yellow-800',
      low: 'bg-green-200 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}>
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl overflow-hidden flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex justify-between items-center border-b">
          <div>
            <h2 className="text-xl font-bold">Notificações</h2>
            {unreadCount > 0 && (
              <p className="text-sm opacity-90">
                {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Ações */}
        {unreadCount > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Marcar todas como lidas
            </button>
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin">
                <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaBell className="text-4xl mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                // Verificar se está marcado como lido pelo usuário
                const isRead = notification.readBy && notification.readBy.length > 0;

                return (
                  <div
                    key={notification._id}
                    className={`p-4 border-l-4 transition hover:bg-gray-50 ${getNotificationColor(
                      notification.type
                    )} ${!isRead ? 'bg-opacity-100' : 'opacity-75'}`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">
                            {notification.title}
                          </h3>
                          {notification.priority && (
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${getPriorityBadge(
                                notification.priority
                              )}`}
                            >
                              {notification.priority === 'high'
                                ? 'Alta'
                                : notification.priority === 'medium'
                                ? 'Média'
                                : 'Baixa'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!isRead && (
                          <button
                            onClick={() =>
                              handleMarkAsRead(notification._id)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Marcar como lido"
                          >
                            <FaCheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteNotification(notification._id)
                          }
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                          title="Deletar"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
