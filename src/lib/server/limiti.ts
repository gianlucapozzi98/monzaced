/**
 * Limite di richieste in memoria (finestra scorrevole). Adatto a un solo processo Node.
 * Con più istanze serve un archivio condiviso (es. Redis): vedi README.
 */
const finestre = new Map<string, number[]>();

export function consentito(chiave: string, max: number, finestraMs: number): boolean {
  const ora = Date.now();
  const lista = (finestre.get(chiave) ?? []).filter((t) => ora - t < finestraMs);
  if (lista.length >= max) {
    finestre.set(chiave, lista);
    return false;
  }
  lista.push(ora);
  finestre.set(chiave, lista);
  if (finestre.size > 5000) {
    for (const [k, v] of finestre) if (!v.some((t) => ora - t < 3600_000)) finestre.delete(k);
  }
  return true;
}

export function ipCliente(request: Request, clientAddress: string | undefined, fidati: boolean): string {
  if (fidati) {
    const xf = request.headers.get('x-forwarded-for');
    if (xf) return xf.split(',')[0].trim();
  }
  return clientAddress ?? 'sconosciuto';
}
