import React, { useEffect, useRef } from 'react';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'asleep';

export interface HolographicAvatarProps {
  state: AvatarState;
  audioLevel?: number; // 0 to 1 live input/output meter
  currentPhoneme?: {
    jawOpen: number;     // 0 (closed) to 1 (wide)
    mouthWidth: number;  // 0.8 (puckered) to 1.25 (spread)
    mouthRound: number;  // 0 (flat) to 1 (round 'o')
    lipClosure: number;  // 0 (open) to 1 (pressed 'm', 'b')
  };
  themeColor?: string; // hex like #06b6d4, #10b981, #f59e0b, #a855f7
  width?: number;
  height?: number;
}

// 3D landmarks for real facial geometry (x, y, z normalized around center)
interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const HolographicAvatarCanvas: React.FC<HolographicAvatarProps> = ({
  state = 'idle',
  audioLevel = 0,
  currentPhoneme,
  themeColor = '#06b6d4',
  width = 340,
  height = 340,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth animation tracking refs
  const timeRef = useRef<number>(0);
  const blinkRef = useRef<{ isBlinking: boolean; progress: number; nextBlink: number }>({
    isBlinking: false,
    progress: 0,
    nextBlink: 2500,
  });

  const saccadeRef = useRef<{ targetX: number; targetY: number; currX: number; currY: number; nextShift: number }>({
    targetX: 0,
    targetY: 0,
    currX: 0,
    currY: 0,
    nextShift: 1800,
  });

  // Smooth mouth interpolators
  const mouthStateRef = useRef({
    jaw: 0,
    width: 1,
    round: 0,
    closure: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      timeRef.current += dt;
      const t = timeRef.current;

      // Handle Blinking logic
      const blink = blinkRef.current;
      if (!blink.isBlinking && now > blink.nextBlink) {
        blink.isBlinking = true;
        blink.progress = 0;
      }
      if (blink.isBlinking) {
        blink.progress += dt * 8; // blink speed
        if (blink.progress >= 1) {
          blink.isBlinking = false;
          blink.progress = 0;
          blink.nextBlink = now + 2500 + Math.random() * 3000;
        }
      }

      // Handle Eye Saccades (natural subtle glance shifts)
      const saccade = saccadeRef.current;
      if (now > saccade.nextShift) {
        if (state === 'thinking') {
          // Look away / up when pondering
          saccade.targetX = (Math.random() > 0.5 ? 0.35 : -0.35);
          saccade.targetY = -0.3;
        } else if (state === 'listening') {
          // Meet user's gaze directly
          saccade.targetX = (Math.random() - 0.5) * 0.1;
          saccade.targetY = (Math.random() - 0.5) * 0.08;
        } else {
          saccade.targetX = (Math.random() - 0.5) * 0.25;
          saccade.targetY = (Math.random() - 0.5) * 0.15;
        }
        saccade.nextShift = now + 1200 + Math.random() * 2200;
      }
      // Smooth lerp to gaze target
      saccade.currX += (saccade.targetX - saccade.currX) * 0.1;
      saccade.currY += (saccade.targetY - saccade.currY) * 0.1;

      // Smooth mouth parameters interpolation
      const targetMouth = currentPhoneme || {
        jawOpen: state === 'speaking' ? Math.min(audioLevel * 1.8, 1) : 0,
        mouthWidth: state === 'speaking' ? 1 + Math.sin(t * 12) * 0.15 : 1,
        mouthRound: 0,
        lipClosure: 0,
      };

      const m = mouthStateRef.current;
      m.jaw += (targetMouth.jawOpen - m.jaw) * 0.35;
      m.width += (targetMouth.mouthWidth - m.width) * 0.35;
      m.round += (targetMouth.mouthRound - m.round) * 0.35;
      m.closure += (targetMouth.lipClosure - m.closure) * 0.35;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = width * 0.38;

      // Head Posture (Yaw, Pitch, Roll)
      let headYaw = Math.sin(t * 0.8) * 0.04;
      let headPitch = Math.cos(t * 0.6) * 0.03;
      let headRoll = Math.sin(t * 0.4) * 0.02;

      if (state === 'thinking') {
        headYaw += 0.08;
        headPitch -= 0.06; // tilted up-pondering
      } else if (state === 'listening') {
        headPitch += 0.03; // attentive slight forward tilt
      } else if (state === 'speaking') {
        // Rhythmic head nod on speech
        headPitch += Math.sin(t * 7) * 0.035 * (m.jaw > 0.1 ? 1 : 0.3);
      } else if (state === 'asleep') {
        headPitch += 0.1; // head dropped in sleep
      }

      // 3D Projection Helper
      const project = (p: Point3D): { x: number; y: number; z: number } => {
        // Rotate around Y (Yaw)
        let x1 = p.x * Math.cos(headYaw) + p.z * Math.sin(headYaw);
        let y1 = p.y;
        let z1 = -p.x * Math.sin(headYaw) + p.z * Math.cos(headYaw);

        // Rotate around X (Pitch)
        let x2 = x1;
        let y2 = y1 * Math.cos(headPitch) - z1 * Math.sin(headPitch);
        let z2 = y1 * Math.sin(headPitch) + z1 * Math.cos(headPitch);

        // Perspective divide
        const focal = 3.5;
        const persp = focal / (focal + z2);

        return {
          x: centerX + x2 * scale * persp,
          y: centerY + y2 * scale * persp,
          z: z2,
        };
      };

      // Set styles for Holographic Render
      ctx.strokeStyle = themeColor;
      ctx.fillStyle = themeColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = state === 'speaking' || state === 'listening' ? 12 : 6;

      // 1. Holographic Halo Rings orbiting around head
      const ringCount = 2;
      for (let r = 0; r < ringCount; r++) {
        ctx.beginPath();
        const ringRadius = scale * (1.18 + r * 0.12);
        const ringRot = t * (0.4 + r * 0.2);
        ctx.ellipse(
          centerX,
          centerY - scale * 0.05,
          ringRadius,
          ringRadius * 0.28,
          ringRot * (r === 0 ? 1 : -1),
          0,
          Math.PI * 2
        );
        ctx.save();
        ctx.strokeStyle = themeColor;
        ctx.globalAlpha = 0.25 + (r === 0 ? Math.sin(t * 3) * 0.1 : 0);
        ctx.setLineDash([8, 12]);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Cranial dome & Jawline contours (Real Facial Geometry)
      const jawYDrop = m.jaw * 0.18;
      const faceContourRaw: Point3D[] = [
        // Forehead / Temples / Crown
        { x: -0.65, y: -0.6, z: 0.1 },
        { x: -0.45, y: -0.95, z: 0.2 },
        { x: 0, y: -1.05, z: 0.25 },
        { x: 0.45, y: -0.95, z: 0.2 },
        { x: 0.65, y: -0.6, z: 0.1 },
        // Cheeks
        { x: 0.72, y: -0.15, z: 0.15 },
        { x: 0.68, y: 0.25, z: 0.2 },
        // Jaw to Chin (affected by jaw open)
        { x: 0.45, y: 0.65 + jawYDrop * 0.5, z: 0.3 },
        { x: 0.22, y: 0.95 + jawYDrop, z: 0.4 },
        { x: 0, y: 1.02 + jawYDrop * 1.1, z: 0.45 }, // Chin peak
        { x: -0.22, y: 0.95 + jawYDrop, z: 0.4 },
        { x: -0.45, y: 0.65 + jawYDrop * 0.5, z: 0.3 },
        { x: -0.68, y: 0.25, z: 0.2 },
        { x: -0.72, y: -0.15, z: 0.15 },
      ];

      // Draw Face Perimeter
      ctx.beginPath();
      const projFirst = project(faceContourRaw[0]);
      ctx.moveTo(projFirst.x, projFirst.y);
      for (let i = 1; i < faceContourRaw.length; i++) {
        const p = project(faceContourRaw[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.stroke();
      ctx.restore();

      // Cheekbone & Forehead Geometric Depth Lines
      const cheekL = project({ x: -0.5, y: 0.05, z: 0.35 });
      const cheekR = project({ x: 0.5, y: 0.05, z: 0.35 });
      const noseBridge = project({ x: 0, y: -0.1, z: 0.6 });

      ctx.beginPath();
      ctx.moveTo(cheekL.x, cheekL.y);
      ctx.lineTo(noseBridge.x, noseBridge.y);
      ctx.lineTo(cheekR.x, cheekR.y);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.restore();

      // 3. Eyebrows (track emotion: thinking furrows/tilts, listening raises)
      let browTiltL = 0;
      let browTiltR = 0;
      let browRaise = 0;

      if (state === 'thinking') {
        browTiltL = 0.08;
        browTiltR = -0.04;
        browRaise = -0.04;
      } else if (state === 'listening') {
        browRaise = 0.06;
      }

      const browPointsL: Point3D[] = [
        { x: -0.52, y: -0.45 + browRaise - browTiltL, z: 0.35 },
        { x: -0.36, y: -0.52 + browRaise, z: 0.42 },
        { x: -0.18, y: -0.46 + browRaise + browTiltL, z: 0.45 },
      ];
      const browPointsR: Point3D[] = [
        { x: 0.18, y: -0.46 + browRaise + browTiltR, z: 0.45 },
        { x: 0.36, y: -0.52 + browRaise, z: 0.42 },
        { x: 0.52, y: -0.45 + browRaise - browTiltR, z: 0.35 },
      ];

      const drawPolyline = (pts: Point3D[], alpha = 0.9, widthOverride = 2) => {
        ctx.save();
        ctx.lineWidth = widthOverride;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        const p0 = project(pts[0]);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < pts.length; i++) {
          const pt = project(pts[i]);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      };

      drawPolyline(browPointsL, 0.9, 2);
      drawPolyline(browPointsR, 0.9, 2);

      // 4. Eyes & Pupils with natural blinking & saccades
      const blinkFactor = blink.isBlinking ? Math.sin(blink.progress * Math.PI) : 0;
      const eyeLidsClosed = state === 'asleep' ? 0.8 : blinkFactor;

      const drawEye = (isRight: boolean) => {
        const sign = isRight ? 1 : -1;
        const eyeCenter3D: Point3D = { x: sign * 0.34, y: -0.32, z: 0.42 };
        const center = project(eyeCenter3D);

        const eyeW = scale * 0.16;
        const eyeH = Math.max(scale * 0.08 * (1 - eyeLidsClosed * 0.92), 1.5);

        // Eye Contour (Upper & Lower Lid)
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Pupil / Iris (only visible if eyes not closed)
        if (eyeLidsClosed < 0.75) {
          const pupilX = center.x + saccade.currX * eyeW * 0.45;
          const pupilY = center.y + saccade.currY * eyeH * 0.3;
          ctx.beginPath();
          ctx.arc(pupilX, pupilY, Math.min(eyeH * 0.7, 5), 0, Math.PI * 2);
          ctx.fillStyle = themeColor;
          ctx.fill();
        }
        ctx.restore();
      };

      drawEye(false); // Left eye
      drawEye(true);  // Right eye

      // 5. Nose (Bridge & Nostrils)
      const noseBridgeTop = project({ x: 0, y: -0.35, z: 0.52 });
      const noseTip = project({ x: 0, y: 0.1, z: 0.65 });
      const nostrilL = project({ x: -0.12, y: 0.15, z: 0.52 });
      const nostrilR = project({ x: 0.12, y: 0.15, z: 0.52 });

      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.moveTo(noseBridgeTop.x, noseBridgeTop.y);
      ctx.lineTo(noseTip.x, noseTip.y);
      ctx.lineTo(nostrilL.x, nostrilL.y);
      ctx.moveTo(noseTip.x, noseTip.y);
      ctx.lineTo(nostrilR.x, nostrilR.y);
      ctx.stroke();
      ctx.restore();

      // 6. 👄 Real Lip-Sync Mouth (~50 mouth shapes/s formant derived)
      // Formant geometry:
      // jawOpen controls vertical opening
      // mouthWidth controls horizontal stretch (ee vs oo)
      // mouthRound pulls corners inward
      // lipClosure squeezes lips together (m, p, b)
      const mouthCenterY = 0.45 + jawYDrop * 0.35;
      const mouthHalfW = 0.22 * m.width * (1 - m.round * 0.25);
      const verticalOpen = Math.max((m.jaw * 0.22) * (1 - m.closure * 0.9), 0.015);

      const upperLipL: Point3D = { x: -mouthHalfW, y: mouthCenterY - verticalOpen * 0.4, z: 0.45 };
      const upperLipMid: Point3D = { x: 0, y: mouthCenterY - verticalOpen * 0.7, z: 0.55 };
      const upperLipR: Point3D = { x: mouthHalfW, y: mouthCenterY - verticalOpen * 0.4, z: 0.45 };

      const lowerLipMid: Point3D = { x: 0, y: mouthCenterY + verticalOpen * 0.9, z: 0.52 };

      const pUL = project(upperLipL);
      const pUM = project(upperLipMid);
      const pUR = project(upperLipR);
      const pLM = project(lowerLipMid);

      ctx.save();
      ctx.beginPath();
      // Upper lip curve
      ctx.moveTo(pUL.x, pUL.y);
      ctx.quadraticCurveTo(pUM.x, pUM.y, pUR.x, pUR.y);
      // Lower lip curve
      ctx.quadraticCurveTo(pLM.x, pLM.y, pUL.x, pUL.y);
      ctx.closePath();

      // Inner oral glow if mouth is open
      if (verticalOpen > 0.04) {
        ctx.fillStyle = themeColor;
        ctx.globalAlpha = 0.2;
        ctx.fill();
      }

      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 7. Glowing Holographic Landmark Nodes (crosshairs at chin, temples, cheeks)
      const nodes: Point3D[] = [
        { x: -0.65, y: -0.6, z: 0.1 },
        { x: 0.65, y: -0.6, z: 0.1 },
        { x: -0.5, y: 0.05, z: 0.35 },
        { x: 0.5, y: 0.05, z: 0.35 },
        { x: 0, y: 1.02 + jawYDrop * 1.1, z: 0.45 },
      ];

      nodes.forEach((node) => {
        const pt = project(node);
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = themeColor;
        ctx.fill();

        // Mini crosshair tick
        ctx.strokeStyle = themeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pt.x - 5, pt.y);
        ctx.lineTo(pt.x + 5, pt.y);
        ctx.moveTo(pt.x, pt.y - 5);
        ctx.lineTo(pt.x, pt.y + 5);
        ctx.stroke();
        ctx.restore();
      });

      // 8. Subtle Digital Scanlines over face
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = themeColor;
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, audioLevel, currentPhoneme, themeColor, width, height]);

  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-[340px] aspect-square drop-shadow-[0_0_25px_rgba(6,182,212,0.25)]"
      />
    </div>
  );
};
