let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
  arrow[i].addEventListener("click", (e)=>{
 let arrowParent = e.target.parentElement.parentElement;
 arrowParent.classList.toggle("showMenu");
  });
}

let sidebar = document.querySelector(".sidebar");

let sidebarBtnOpen = document.querySelector(".sidebarbutton-open");
let sidebarBtnClose = document.querySelector(".sidebarbutton-close");

sidebarBtnOpen.addEventListener("click", () => {
  sidebar.classList.toggle("close");
  sidebarBtnOpen.style.display = "None";
  sidebarBtnClose.style.display = "block";
  // var elements = document.querySelectorAll('.sub-menu');
  // elements.forEach(function(element) {element.style.backgroundColor = 'white';});  
});

sidebarBtnClose.addEventListener("click", ()=>{
  sidebar.classList.toggle("close");
  sidebarBtnClose.style.display = "None";
  sidebarBtnOpen.style.display = "block";
  // var elements = document.querySelectorAll('.sub-menu');
  // elements.forEach(function(element) {element.style.backgroundColor = '#e6e6e6';});
});