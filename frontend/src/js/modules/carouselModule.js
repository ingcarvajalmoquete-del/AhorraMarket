const AUTOPLAY_INTERVAL_MS = 6000;

export function initHeroCarousel() {
  const track = document.getElementById("heroTrack");
  const dotsContainer = document.getElementById("heroDots");
  const prevButton = document.getElementById("heroPrev");
  const nextButton = document.getElementById("heroNext");

  if (!track) return;

  const slideCount = track.children.length - 1;
  let index = 0;

  dotsContainer.innerHTML = "";
  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement("button");
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function updateDots() {
    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle("active", i === index % slideCount);
    });
  }

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();

    if (index === slideCount) {
      window.setTimeout(() => {
        track.style.transition = "none";
        index = 0;
        track.style.transform = "translateX(0)";
        void track.offsetWidth;
        track.style.transition = "";
      }, 500);
    }
  }

  function goTo(newIndex) {
    index = newIndex;
    render();
  }

  function next() {
    index += 1;
    render();
  }

  function prev() {
    index = index <= 0 ? slideCount - 1 : index - 1;
    render();
  }

  prevButton?.addEventListener("click", prev);
  nextButton?.addEventListener("click", next);
  window.setInterval(next, AUTOPLAY_INTERVAL_MS);

  render();
}
