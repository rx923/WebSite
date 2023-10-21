// JavaScript for the left slideshow
let leftIndex = 0;
const leftSlides = document.querySelectorAll('#leftSlideshow Image1', '#leftSlideshow Image2', '#leftSlideshow Image3');

function leftShowSlide(index) {
  leftSlides.forEach((slide, i) => {
    if (i === index) {
      slide.style.display = 'block';
    } else {
      slide.style.display = 'none';
    }
  });
}

function leftNextSlide() {
  leftIndex = (leftIndex + 1) % leftSlides.length;
  leftShowSlide(leftIndex);
}

function leftPrevSlide() {
  leftIndex = (leftIndex - 1 + leftSlides.length) % leftSlides.length;
  leftShowSlide(leftIndex);
}

leftShowSlide(leftIndex);

// JavaScript for the right slideshow
let rightIndex = 0;
const rightSlides = document.querySelectorAll('#rightSlideshow img');

function rightShowSlide(index) {
  rightSlides.forEach((slide, i) => {
    if (i === index) {
      slide.style.display = 'block';
    } else {
      slide.style.display = 'none';
    }
  });
}

function rightNextSlide() {
  rightIndex = (rightIndex + 1) % rightSlides.length;
  rightShowSlide(rightIndex);
}

function rightPrevSlide() {
  rightIndex = (rightIndex - 1 + rightSlides.length) % rightSlides.length;
  rightShowSlide(rightIndex);
}

rightShowSlide(rightIndex);