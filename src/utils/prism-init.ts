import Prism from 'prismjs';

// Explicitly attach Prism to the window and global scope before any Prism plugins or grammar components are loaded
if (typeof window !== 'undefined') {
  (window as any).Prism = Prism;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Prism = Prism;
}

export default Prism;
