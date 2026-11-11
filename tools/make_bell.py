"""Synthesises a small, soft church handbell (struck-bell partials with their own decays) -> assets/bell.wav.
Written to a file only; never played."""
import pathlib, wave
import numpy as np

SR, DUR, F0 = 22050, 1.6, 784.0                       # G5, a small handbell
t = np.arange(int(SR * DUR)) / SR
# (ratio to the strike tone, loudness, decay seconds): hum, prime, minor third, fifth, nominal, upper partials
partials = [(0.5, .30, 1.30), (1.0, .55, .95), (1.19, .32, .70), (1.5, .18, .55), (2.0, .34, .60), (2.52, .10, .30), (3.01, .07, .22), (4.1, .04, .12)]
sig = np.zeros_like(t)
for r, a, d in partials:
    sig += a * np.exp(-t / d) * np.sin(2 * np.pi * F0 * r * t + r)      # slight phase spread
strike = np.minimum(1, t / 0.004)                                       # soft attack, no click
sig *= strike
sig *= np.where(t > DUR - .25, (DUR - t) / .25, 1)                      # fade out
sig = sig / np.abs(sig).max() * 0.55                                    # quiet: well under full scale
out = pathlib.Path(__file__).resolve().parent.parent / "assets" / "bell.wav"
out.parent.mkdir(exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((sig * 32767).astype("<i2").tobytes())
print(out, out.stat().st_size, "bytes; peak", round(float(np.abs(sig).max()), 3))
