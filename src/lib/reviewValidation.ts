/**
 * Utilitários de validação e sanitização de reviews
 * Baseado nas mudanças da API v1
 */

export const MIN_REVIEW_LENGTH = 25;

/**
 * Sanitiza o texto da review (simula o comportamento do backend)
 * - Remove espaços no início e fim
 * - Substitui múltiplos espaços por um único espaço
 */
export function sanitizeReviewText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Valida o texto da review
 * @param text - Texto da review
 * @returns Mensagem de erro ou null se válido
 */
export function validateReviewText(text: string | null | undefined): string | null {
  // Review é opcional
  if (!text) return null;

  // Sanitizar primeiro
  const sanitized = sanitizeReviewText(text);

  // Validar tamanho mínimo
  if (sanitized.length < MIN_REVIEW_LENGTH) {
    return `A review deve ter no mínimo ${MIN_REVIEW_LENGTH} caracteres (sem contar espaços extras)`;
  }

  return null;
}

/**
 * Calcula o tempo restante em horas para pontuar uma review
 * @param watchedAt - Data em que o conteúdo foi assistido
 * @returns Horas restantes (0 se expirado)
 */
export function getReviewDeadlineHours(watchedAt: Date | string): number {
  const watchedDate = typeof watchedAt === 'string' ? new Date(watchedAt) : watchedAt;
  const now = new Date();

  let hoursElapsed = (now.getTime() - watchedDate.getTime()) / (1000 * 60 * 60);

  // Se a data estiver no futuro (delay de rede/timezone), tratar como recém assistido
  if (hoursElapsed < 0) {
    hoursElapsed = 0;
  }

  const hoursRemaining = Math.max(0, 72 - hoursElapsed);
  return hoursRemaining;
}

/**
 * Verifica se a review ainda está dentro da janela de 72h para pontuar
 * @param watchedAt - Data em que o conteúdo foi assistido
 * @returns true se ainda pode pontuar
 */
export function canEarnPointsForReview(watchedAt: Date | string): boolean {
  return getReviewDeadlineHours(watchedAt) > 0;
}

/**
 * Formata a mensagem de deadline da review
 * @param watchedAt - Data em que o conteúdo foi assistido
 * @returns Mensagem formatada ou null se expirado
 */
export function getReviewDeadlineMessage(watchedAt: Date | string): string | null {
  const hoursRemaining = getReviewDeadlineHours(watchedAt);

  if (hoursRemaining === 0) {
    return null;
  }

  if (hoursRemaining < 1) {
    const minutesRemaining = Math.floor(hoursRemaining * 60);
    return `${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''} restante${minutesRemaining !== 1 ? 's' : ''} para pontuar`;
  }

  if (hoursRemaining < 24) {
    return `${Math.floor(hoursRemaining)}h restantes para pontuar`;
  }

  const daysRemaining = Math.floor(hoursRemaining / 24);
  const hoursRemainingInDay = Math.floor(hoursRemaining % 24);

  if (daysRemaining === 1) {
    return `1 dia e ${hoursRemainingInDay}h restantes para pontuar`;
  }

  return `${daysRemaining} dias e ${hoursRemainingInDay}h restantes para pontuar`;
}
