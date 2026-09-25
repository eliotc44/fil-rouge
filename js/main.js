document.addEventListener("DOMContentLoaded", initialiser);
gsap.registerPlugin(SplitText);

function initialiser(){
    let line = document.querySelector("h1");
 let split = new SplitText(line, { type: "chars", charsClass: "char" });
     gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        repeat: -1,
        duration:1,
        scale:0,
        yoyo: true,
        repeatDelay: 1
    });

}

function playAnimation(shape) {
 // the timeline
  let tl = gsap.timeline();
  tl.from(shape,{
    opacity: 0,
    scale: 0,
    ease: "elastic.out(1,0.2)",
  })
  .to(shape,{
    rotation: "random([-360, 360])",
  }, "<")
  .to(shape,{
    y: "120vh",
    ease: "back.in(.4)",
    duration: 1,
  },0)
  
}
// interaction props
let gap = 100; // this number spaces the 'lil shapes out

/* --------------------------------

The other stuff...

------------------------------------*/
let flair = gsap.utils.toArray(".flair");
let index = 0;
let wrapper = gsap.utils.wrap(0, flair.length);
gsap.defaults({duration: 1})

let mousePos = { x: 0, y: 0 };
let lastMousePos = mousePos;
let cachedMousePos = mousePos;

window.addEventListener("mousemove", (e) => {
  mousePos = {
    x: e.x,
    y: e.y
  };
});

gsap.ticker.add(ImageTrail);

function ImageTrail() {
  let travelDistance = Math.hypot(
    lastMousePos.x - mousePos.x,
    lastMousePos.y - mousePos.y
  );

  // keep the previous mouse position for animation
  cachedMousePos.x = gsap.utils.interpolate(
    cachedMousePos.x || mousePos.x,
    mousePos.x,
    0.1
  );
  cachedMousePos.y = gsap.utils.interpolate(
    cachedMousePos.y || mousePos.y,
    mousePos.y,
    0.1
  );

  if (travelDistance > gap) {
    animateImage();
    lastMousePos = mousePos;
  }
}

function animateImage() {
  let wrappedIndex = wrapper(index);

  console.log(index, flair.length);

  let img = flair[wrappedIndex];
  gsap.killTweensOf(img);
  
  gsap.set(img, {
    clearProps: "all",
  });
  

  gsap.set(img, {
    opacity: 1,
    left: mousePos.x,
    top: mousePos.y,
    xPercent: -50,
    yPercent: -50,
  });


  playAnimation(img);

  index++;
}