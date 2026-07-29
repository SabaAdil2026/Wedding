import confetti from 'canvas-confetti';

export function fireGoldConfetti() {
  const colors = ['#D4AF37', '#F2D98E', '#0B0B0C', '#ffffff'];
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors, scalar: 1.1 });
  setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 }, colors }), 250);
}
