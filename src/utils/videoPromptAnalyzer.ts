export interface TimelinePhase {
  id: string;
  phaseTitle: string;
  timeRange: string; // e.g. "00:00 - 00:02.5"
  startSec: number;
  endSec: number;
  fpsCadence: string; // e.g. "24.000 fps (180° shutter angle, 1/48s)"
  cameraChoreography: string; // e.g. "Slow 0.4x dolly-in on 35mm anamorphic prime"
  subjectAction: string; // Detailed physical action
  consistencyAnchor: string; // Visual features that must remain immutable
  lightingAndAtmosphere: string; // Light direction and volumetric particle interaction
}

export interface VideoPromptAnalysisResult {
  concept: string;
  frameRate: string;
  pacingStyle: string;
  targetEngine: string;
  visualStyle: string;
  aspectRatio: string;
  conceptAnalysis: {
    coreSubjectAnchor: string;
    spatialDepth: string;
    cinematicOptics: string;
    lightingColorGrade: string;
    pacingStrategy: string;
  };
  timelinePhases: TimelinePhase[];
  masterPrompt: string;
  concisePrompt: string;
  negativePrompt: string;
  audioDesign: {
    ambientScore: string;
    foleyCues: string[];
    voiceoverMood?: string;
  };
  consistencyTokens: string[];
}

// Algorithmic Fallback & Instant Generator for 10-second video prompts
export function generateLocalVideoPromptAnalysis(
  concept: string,
  frameRate: string = '24fps',
  pacingStyle: string = 'cinematic',
  targetEngine: string = 'Runway Gen-3',
  visualStyle: string = 'Arri Alexa 35mm',
  aspectRatio: string = '16:9'
): VideoPromptAnalysisResult {
  const cleanConcept = concept.trim() || 'Cinematic futuristic city street at dusk with glowing rain reflections';

  // Extract key themes
  const isCyberpunk = /cyberpunk|neon|tokyo|future|sci-fi|robot|android|hologram/i.test(cleanConcept);
  const isNature = /forest|mountain|ocean|river|water|tree|animal|bird|sunset|nature|landscape/i.test(cleanConcept);
  const isCharacter = /person|man|woman|child|detective|warrior|scholar|girl|boy|face|eyes|character/i.test(cleanConcept);
  const isSpace = /space|galaxy|planet|star|nebula|astronaut|cosmic/i.test(cleanConcept);

  // Subject Anchor
  let subjectAnchor = '';
  if (isCharacter) {
    subjectAnchor = `Primary central figure with fixed physical geometry, immutable tailored garment textures, invariant facial bone structure, hair strands locked in natural physics simulation, and constant specular eye reflections.`;
  } else if (isNature) {
    subjectAnchor = `Organic focal subject anchored with consistent microscopic surface moisture, fixed geological silhouette, and natural foliage wind-sway vector maintaining steady physical mass.`;
  } else if (isSpace) {
    subjectAnchor = `Orbital celestial body and spacecraft chassis with unchanging hull panel geometry, specular solar panel sheen, and immutable rotational momentum.`;
  } else {
    subjectAnchor = `Central focal subject with permanent material properties, invariant silhouette boundary, and consistent refractive light transmission to prevent morphing or topological drift.`;
  }

  // Camera & Optics
  let optics = 'Arri Master Anamorphic 35mm T1.4 prime lens, oval optical bokeh, subtle anamorphic blue horizontal streak, shallow depth of field with creamy focal roll-off';
  if (visualStyle.includes('IMAX')) {
    optics = 'IMAX 70mm spherical 65mm sensor, f/2.8, ultra-high micro-contrast, zero optical distortion, edge-to-edge hyper-crisp resolution';
  } else if (visualStyle.includes('Ghibli')) {
    optics = 'Hand-drawn aesthetic with painted cel depth, soft diffuse watercolor illumination, dreamy nostalgic chromatic fringing';
  } else if (visualStyle.includes('16mm')) {
    optics = 'Vintage 16mm Bolex camera, Switar 25mm f/1.4 lens, natural organic celluloid silver halide grain, gentle corner vignette and warm gate flare';
  }

  // Frame rate & shutter
  let fpsDetails = '24.000 fps (180° cinematic shutter, natural 1/48s motion blur for organic human perception)';
  if (frameRate === '30fps') {
    fpsDetails = '29.970 fps (High-fidelity standard broadcast cadence, crisp kinetic fluidity, 1/60s shutter)';
  } else if (frameRate === '60fps') {
    fpsDetails = '60.000 fps (Ultra-fluid high-speed tracking, hyper-smooth mechanical camera gliding, 1/120s shutter)';
  } else if (frameRate === '120fps') {
    fpsDetails = '120.000 fps (Phantom Flex 4K slow-motion capture, frozen micro-droplet kinetic suspension, 1/240s shutter)';
  }

  // Pacing Strategy
  let pacingDesc = '';
  if (pacingStyle === 'kinetic') {
    pacingDesc = 'Dynamic kinetic acceleration from 0-3s, fast tracking speed ramp from 3-7s, and sudden atmospheric inertia brake at 8-10s.';
  } else if (pacingStyle === 'orbit') {
    pacingDesc = 'Continuous 360-degree cylindrical orbital glide maintaining fixed radial distance of 2.2 meters with buttery parallax foreground separation.';
  } else if (pacingStyle === 'macro') {
    pacingDesc = 'Extreme macro depth rack: 0-3s microscopic surface discovery, 3-7s focal translation across micro-textures, 7-10s subtle reveal pull-out.';
  } else {
    pacingDesc = 'Cinematic slow-burn push-in: Gentle 0.35m/s forward tracking dolly, lingering on atmospheric nuances, peaking in emotional visual resonance.';
  }

  // 10-Second Timeline Phases
  const timelinePhases: TimelinePhase[] = [
    {
      id: 'phase-1',
      phaseTitle: 'Phase 1: Spatial Anchor & Momentum Ignition',
      timeRange: '00:00.00 - 00:02.50',
      startSec: 0,
      endSec: 2.5,
      fpsCadence: fpsDetails,
      cameraChoreography: `Slow cinematic dolly-in at 0.35m/s along central longitudinal axis, locked focal plane at 2.4 meters, subtle ease-in inertia.`,
      subjectAction: `Opening frame establishes ${cleanConcept}. Subject enters initial kinetic state; environmental wind and volumetric haze drift gently across foreground.`,
      consistencyAnchor: `Focal subject scale matches initial 35% viewport occupancy; invariant color temperature (4200K base); horizon line locked at lower third.`,
      lightingAndAtmosphere: `Soft directional key light from screen left, subtle blue-cyan fill, atmospheric dust motes floating with authentic Brownian motion.`
    },
    {
      id: 'phase-2',
      phaseTitle: 'Phase 2: Kinetic Progression & Parallax Shift',
      timeRange: '00:02.50 - 00:05.50',
      startSec: 2.5,
      endSec: 5.5,
      fpsCadence: fpsDetails,
      cameraChoreography: `Camera sweeps into a gentle 15-degree orbital pan while maintaining forward momentum; lens aperture breathes slightly from T1.4 to T1.8.`,
      subjectAction: `Dynamic movement unfolds: textures catch specular highlights, secondary physics (fabric drape, water ripples, vapor plumes) react realistically to momentum.`,
      consistencyAnchor: `Zero facial morphing or silhouette distortion; consistent wardrobe geometry; immutable background landmarks preventing spatial hallucination.`,
      lightingAndAtmosphere: `Rim light intensifies creating a crisp separation contour; subtle lens flare blooms across upper anamorphic horizon without washing out contrast.`
    },
    {
      id: 'phase-3',
      phaseTitle: 'Phase 3: Climactic Detail & Specular Peak',
      timeRange: '00:05.50 - 00:08.00',
      startSec: 5.5,
      endSec: 8.0,
      fpsCadence: fpsDetails,
      cameraChoreography: `Slow pedestal rise with micro-dutch tilt (1.5 degrees); rack focus shifts smoothly to reveal intricate foreground micro-detail before returning to subject.`,
      subjectAction: `Peak narrative moment of the 10-second sequence: intricate eye contact, physical contact, or dramatic atmospheric illumination flare reaches maximum intensity.`,
      consistencyAnchor: `Identical color palette and gamma curve; light source direction remains physically coherent with phase 1 and 2 shadows.`,
      lightingAndAtmosphere: `Volumetric god rays pierce through environmental elements; warm amber highlights contrast against deep cool shadows with 14-stop dynamic range.`
    },
    {
      id: 'phase-4',
      phaseTitle: 'Phase 4: Atmospheric Decrescendo & Loop Anchor',
      timeRange: '00:08.00 - 00:10.00',
      startSec: 8.0,
      endSec: 10.0,
      fpsCadence: fpsDetails,
      cameraChoreography: `Camera motion smoothly decelerates into a stable lingering hero frame; focal breathing settles, stabilizing horizon.`,
      subjectAction: `Subject finishes kinetic cycle into an elegant poised posture; ambient atmospheric elements continue subtle drift to allow seamless video loop or cut.`,
      consistencyAnchor: `Final frame anchors matching initial color grading LUT; no abrupt motion cutoff or texture disintegration.`,
      lightingAndAtmosphere: `Lighting stabilizes to balanced master scene mood; soft vignetting gracefully frames the subject.`
    }
  ];

  // Master Video Prompt (High word count, cinematic detail, optimized for Sora / Runway Gen-3 / Kling / Veo)
  const masterPrompt = `[10-SECOND CINEMATIC MASTER SHOT - ${targetEngine.toUpperCase()}]
Concept: ${cleanConcept}.
Execution: Continuous 10-second uninterrupted sequence shot at ${frameRate} with 180-degree cinematic shutter angle. Shot on Arri Alexa 35 with ${optics}.
Timeline & Motion:
- 00:00-00:02.5: Establishing slow dolly-in tracking shot, establishing spatial depth with crisp foreground layers. Subject anchored firmly in frame with immutable physical silhouette and realistic material weight.
- 00:02.5-00:05.5: Fluid camera acceleration into subtle orbital parallax sweep; micro-textures catch directional rim lighting; zero morphing or topological drift.
- 00:05.5-00:08.0: Focal rack to hyper-detailed climactic interaction; volumetric atmospheric scattering with subtle optical anamorphic flare.
- 00:08.0-00:10.0: Smooth camera deceleration into a stable lingering cinematic composition with continuous ambient dust/smoke particle physics.
Aesthetic & Technical: Photorealistic 8K scan, Kodak 5219 film grain emulation, 14 stops dynamic range, deep naturalistic blacks, crisp specular highlights, true-to-life physics simulation, aspect ratio ${aspectRatio}.`;

  const concisePrompt = `Cinematic 10-second continuous shot of ${cleanConcept}, 24fps motion blur, Arri Alexa 35mm anamorphic, slow steady forward tracking dolly, volumetric lighting, photorealistic 8K, no morphing, aspect ratio ${aspectRatio}.`;

  const negativePrompt = `morphing, flickering, jittery frames, frame rate stutter, character shape shifting, temporal inconsistency, distorted hands, duplicate limbs, floating artifacts, digital noise, unnatural speed ramping, pixelation, blurry faces, oversaturated plastic skin, video compression artifacts.`;

  const consistencyTokens = [
    `SUBJECT_ID_LOCK: ${cleanConcept.slice(0, 30)}`,
    `COLOR_LUT: Kodak_5219_ArriAlexa_Rec709`,
    `LIGHT_ORIGIN: Key_45deg_ScreenLeft_5600K`,
    `CAMERA_RIG: Dana_Dolly_35mm_Anamorphic_T1.4`,
    `SHUTTER_ANGLE: 180deg_TrueMotionBlur`,
    `FRAME_CADENCE: ${frameRate}_Steady`
  ];

  return {
    concept: cleanConcept,
    frameRate,
    pacingStyle,
    targetEngine,
    visualStyle,
    aspectRatio,
    conceptAnalysis: {
      coreSubjectAnchor: subjectAnchor,
      spatialDepth: `Layered 3D spatial field: Foreground micro-particles, Midground primary focal subject at 2.4m, Background deep atmospheric horizon at infinity with volumetric fog falloff.`,
      cinematicOptics: optics,
      lightingColorGrade: `Master 3-point cinematic lighting with 5600K key light, 3200K ambient bounce, subtle cyan rim light, graded in ACEScc with rich film curve.`,
      pacingStrategy: pacingDesc,
    },
    timelinePhases,
    masterPrompt,
    concisePrompt,
    negativePrompt,
    audioDesign: {
      ambientScore: `Low cinematic sub-bass drone rising into an ethereal atmospheric synth crescendo, tailored for a 10-second emotional arc.`,
      foleyCues: [
        `00:00 - Soft ambient wind / room tone with gentle spatial stereo panning`,
        `00:03 - Crisp physical interaction foley (fabric rustle / boot step / mechanical hum)`,
        `00:06 - Resonant specular shimmer / whoosh sound accompanying optical light flare`,
        `00:09 - Low frequency tail reverb fading naturally into silence`
      ],
      voiceoverMood: `Quiet, reverent cinematic tone or silence letting the environmental sound design breathe.`
    },
    consistencyTokens,
  };
}
