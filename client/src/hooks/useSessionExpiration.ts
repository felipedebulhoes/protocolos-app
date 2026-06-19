import { useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000; // Avisar 5 minutos antes

export function useSessionExpiration() {
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // Limpar timeouts se não estiver logado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      warningShownRef.current = false;
      return;
    }

    // Resetar refs quando usuário faz login
    warningShownRef.current = false;

    // Configurar aviso de expiração (5 minutos antes)
    const warningTimeout = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        showSessionExpirationWarning();
      }
    }, SESSION_TIMEOUT_MS - WARNING_BEFORE_EXPIRY_MS);

    // Configurar logout automático após expiração
    timeoutRef.current = setTimeout(() => {
      handleSessionExpired();
    }, SESSION_TIMEOUT_MS);

    // Resetar inatividade ao detectar atividade do usuário
    const resetTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      warningShownRef.current = false;

      const newWarningTimeout = setTimeout(() => {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          showSessionExpirationWarning();
        }
      }, SESSION_TIMEOUT_MS - WARNING_BEFORE_EXPIRY_MS);

      timeoutRef.current = setTimeout(() => {
        handleSessionExpired();
      }, SESSION_TIMEOUT_MS);
    };

    // Eventos que resetam a inatividade
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user]);
}

function showSessionExpirationWarning() {
  // Criar e exibir notificação de aviso
  const notification = document.createElement('div');
  notification.id = 'session-warning';
  notification.className = `
    fixed bottom-4 right-4 z-50 p-4 bg-yellow-500 text-white rounded-lg shadow-lg 
    flex items-center gap-3 animate-in slide-in-from-bottom-4
  `;
  notification.innerHTML = `
    <div class="flex-1">
      <p class="font-semibold">Sua sessão está expirando</p>
      <p class="text-sm">Você será desconectado em 5 minutos. Clique para continuar.</p>
    </div>
    <button class="px-3 py-1 bg-white text-yellow-600 rounded font-semibold text-sm hover:bg-yellow-50">
      Continuar
    </button>
  `;

  document.body.appendChild(notification);

  const button = notification.querySelector('button');
  if (button) {
    button.addEventListener('click', () => {
      notification.remove();
      // Reset da inatividade ao clicar
      document.body.dispatchEvent(new Event('click'));
    });
  }

  // Remover notificação após 30 segundos se não interagir
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 30000);
}

function handleSessionExpired() {
  // Remover notificação de aviso se existir
  const warning = document.getElementById('session-warning');
  if (warning) {
    warning.remove();
  }

  // Criar e exibir modal de sessão expirada
  const modal = document.createElement('div');
  modal.id = 'session-expired-modal';
  modal.className = `
    fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm
  `;
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-50">
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-center text-gray-900 mb-2">Sessão Expirada</h3>
      <p class="text-center text-gray-600 mb-6">
        Sua sessão expirou por inatividade. Por favor, faça login novamente para continuar.
      </p>
      <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Fazer Login Novamente
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const button = modal.querySelector('button');
  if (button) {
    button.addEventListener('click', () => {
      // Redirecionar para login
      window.location.href = getLoginUrl();
    });
  }
}
