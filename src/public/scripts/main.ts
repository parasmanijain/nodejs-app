const backdrop = document.querySelector('.backdrop') as HTMLElement | null;
const sideDrawer = document.querySelector('.mobile-nav') as HTMLElement | null;
const menuToggle = document.querySelector('#side-menu-toggle') as HTMLElement | null;

function backdropClickHandler(): void {
  if (backdrop && sideDrawer) {
    backdrop.style.display = 'none';
    sideDrawer.classList.remove('open');
  }
}

function menuToggleClickHandler(): void {
  if (backdrop && sideDrawer) {
    backdrop.style.display = 'block';
    sideDrawer.classList.add('open');
  }
}

if (backdrop) {
  backdrop.addEventListener('click', backdropClickHandler);
}

if (menuToggle) {
  menuToggle.addEventListener('click', menuToggleClickHandler);
}
