import '@testing-library/jest-dom/vitest'

// jsdom no implementa scrollTo.
window.scrollTo = () => {}
