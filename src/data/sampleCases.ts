import { SampleCase } from '../types';

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-link-1',
    type: 'link',
    title: 'Viral Breaking News Post on X',
    subtitle: 'Claims regarding sudden central bank gold reserves seizure',
    sourceUrl: 'https://x.com/BreakingGlobalAlerts/status/189283749201',
    previewImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    description: 'A viral X/Twitter post alleging secret government emergency decree without backing official statements or standard financial reporting.',
    expectedScore: 24,
    expectedVerdict: 'HIGHLY_DECEPTIVE',
    sampleInput: {
      url: 'https://x.com/BreakingGlobalAlerts/status/189283749201',
      postText: 'URGENT: Central Banks execute secret protocol freezing all private gold vaults across 14 nations overnight! Official blackout in effect. Retweet before censorship!',
      platform: 'X (Twitter)',
      platformAuthor: '@BreakingGlobalAlerts'
    }
  },
  {
    id: 'sample-link-2',
    type: 'link',
    title: 'Facebook Health Remedy Post',
    subtitle: 'Unverified cure for chronic joint pain using household spice',
    sourceUrl: 'https://facebook.com/HealthMiraclesDaily/posts/9910283',
    previewImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Social post marketing an unapproved natural tincture as a guaranteed 24-hour medical cure with deceptive scientific jargon.',
    expectedScore: 32,
    expectedVerdict: 'MISLEADING',
    sampleInput: {
      url: 'https://facebook.com/HealthMiraclesDaily/posts/9910283',
      postText: 'Doctors don\'t want you to know this simple 1-tsp kitchen trick that regenerates cartilage completely in 48 hours!',
      platform: 'Facebook',
      platformAuthor: 'Health Miracles Daily'
    }
  },
  {
    id: 'sample-link-3',
    type: 'link',
    title: 'Verified Reuters Tech News Article',
    subtitle: 'Quantum Computing breakthrough announced by national laboratory',
    sourceUrl: 'https://www.reuters.com/technology/quantum-leap-lab-announcement',
    previewImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    description: 'Legitimate science reporting citing peer-reviewed papers and quotes from lead researchers.',
    expectedScore: 94,
    expectedVerdict: 'VERIFIED_REAL',
    sampleInput: {
      url: 'https://www.reuters.com/technology/quantum-leap-lab-announcement',
      postText: 'Researchers achieve 99.9% error correction in room-temperature qubit processors, paving way for practical commercial deployment.',
      platform: 'Reuters News',
      platformAuthor: 'Reuters Science Desk'
    }
  },
  {
    id: 'sample-image-1',
    type: 'image',
    title: 'AI Photorealistic Explosion Photo',
    subtitle: 'Viral photo of landmark incident created via Midjourney v6',
    previewImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description: 'Generative AI synthetic image displaying irregular background geometry, distorted text in signage, and unnaturally smooth specular reflections.',
    expectedScore: 91,
    expectedVerdict: 'HIGH_RISK_DEEPFAKE',
    sampleInput: {
      fileName: 'viral_explosion_synthetic.png',
      contextUrl: 'https://instagram.com/p/C9x81aB_photo',
      claims: 'Alleged real-time photo of a chemical factory explosion in industrial district.'
    }
  },
  {
    id: 'sample-audio-1',
    type: 'audio',
    title: 'Political Figure Voice Clone Audio',
    subtitle: 'Audio recording claiming secret policy change in private call',
    previewImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
    description: 'AI Voice Clone exhibits sharp high-frequency spectral cutoffs above 11kHz, lacking natural breathing rhythms and room acoustics.',
    expectedScore: 88,
    expectedVerdict: 'SYNTHETIC_AI',
    sampleInput: {
      fileName: 'leaked_call_audio.wav',
      contextUrl: 'https://tiktok.com/@politiconews/video/7281920',
      claims: 'Supposedly leaked 20-second phone recording of mayor agreeing to illicit zoning deals.'
    }
  },
  {
    id: 'sample-video-1',
    type: 'video',
    title: 'Deepfake Lipsync Video Clip',
    subtitle: 'CEO video announcement modified with neural lipsync',
    previewImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    description: 'Video shows subtle boundary blurring around jawline during fast speech, unnatural eye blinking cadence (<2 blinks/min), and mismatched lip phonemes.',
    expectedScore: 95,
    expectedVerdict: 'HIGH_RISK_DEEPFAKE',
    sampleInput: {
      fileName: 'ceo_emergency_announcement.mp4',
      contextUrl: 'https://youtube.com/watch?v=fake_ceo_clip',
      claims: 'Video snippet showing tech company CEO announcing sudden stock liquidations.'
    }
  }
];
