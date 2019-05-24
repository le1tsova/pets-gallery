"use strict";
let list = document.querySelector(".list-cats");
fetchListCats();
function fetchListCats() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:3000/cats");
  xhr.send();

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) {
      return;
    }
    let cats = xhr.responseText;
    cats = JSON.parse(cats);

    bildListCats(cats, list);
  };
}

function bildListCats(dataList, container) {
  var ulCats = document.createElement("ul");
  ulCats.classList.add("main-menu");

  for (let i = 0; i < dataList.length; i++) {
    const element = dataList[i];
    let liItem = document.createElement("li");
    liItem.classList.add("menu-item");
    let liReferense = document.createElement("a");
    liReferense.classList.add("li-reference");
    liReferense.classList.add("unviewed");
    liReferense.setAttribute("href", "#");
    liReferense.setAttribute("data-id", element.id);
    liReferense.textContent = element.name;
    liItem.appendChild(liReferense);
    ulCats.appendChild(liItem);
  }

  container.appendChild(ulCats);
  let linCats = document.querySelector(".main-menu");
  linCats.addEventListener("click", fetchInfoOfCat);
  linCats.addEventListener("click", fetchCatPhoto);
}

function fetchInfoOfCat(event) {
  currentItem(event.target);
  let xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "http://localhost:3000/cats/" + event.target.getAttribute("data-id")
  );
  xhr.send();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) {
      return;
    }
    let cats = xhr.responseText;
    cats = JSON.parse(cats);
    // console.log(cats);

    displayInfoOfCat(cats);
    getCommentsOfCat(cats.payload.threadId);
  };
}
let currentCat = document.querySelector(".text-content");

function displayInfoOfCat(info) {
  currentCat.textContent = "";
  let headName = document.createElement("h1");
  headName.textContent = info.payload.name;
  let pGender = document.createElement("p");
  pGender.textContent = displayGender(info.payload.gender);
  let pAge = document.createElement("p");
  pAge.textContent = "Лет: " + info.payload.age;
  currentCat.appendChild(headName, pGender, pAge);
  currentCat.appendChild(pGender);
  currentCat.appendChild(pAge);
}

function displayGender(gender) {
  if (gender === "male") {
    return "Мальчик ";
  } else return "Девочка ";
}

function getCommentsOfCat(idComment) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "http://localhost:3000/threads/" + idComment);
  xhr.send();
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) {
      return;
    }
    let threads = xhr.responseText;
    threads = JSON.parse(threads);
    displayComments(threads);
    // console.log(threads.payload.comments);
  };
}

function displayComments(dataComments) {
  // console.log(commentsArr.payload);

  let listComments = dataComments.payload;

  let placeForComment = document.querySelector(".comments");
  placeForComment.textContent = "";

  let headerComments = document.createElement("h3");
  headerComments.textContent = "Коммментарии";
  placeForComment.append(headerComments);

  if (listComments === undefined) {
    makeDummy();
    return;
  }
  function makeDummy() {
    let dummy = document.createElement("p");
    dummy.textContent = "Здесь еще нет ни одного комментария";
    dummy.className = "comment-text";
    placeForComment.append(dummy);
  }
  if (listComments.comments.length === 0) {
    makeDummy();
    return;
  }

  listComments.comments.forEach(element => {
    let divCommment = document.createElement("div");
    divCommment.className = "comment";
    let autor = document.createElement("h3");
    autor.className = "comment-autor";
    autor.textContent = element.author;

    let textComment = document.createElement("p");
    textComment.className = "comment-text";
    textComment.textContent = element.content;
    divCommment.appendChild(autor);
    divCommment.appendChild(textComment);
    placeForComment.appendChild(divCommment);
  });
}

function currentItem(link) {
  if (link.className === "li-reference view") {
    currentCat.textContent = " ";
    link.classList.remove("view");
    link.classList.add("unviewed");
  } else {
    let anyLink = document.querySelectorAll(".li-reference");
    for (let i = 0; i < anyLink.length; i++) {
      let a = anyLink[i];
      a.classList.remove("view");
      a.classList.add("unviewed");
    }
    link.classList.remove("unviewed");
    link.classList.add("view");
  }
}

function fetchCatPhoto(event) {
  if (event.target.className === "li-reference" || "li-reference unviewed") {
    let xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "http://localhost:3000/cats" +
        "/photo/" +
        event.target.getAttribute("data-id")
    );
    xhr.setRequestHeader("x-api-key", "vzuh");
    xhr.send();

    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      let cats = xhr.responseText;
      cats = JSON.parse(cats);
      // console.log(cats.payload);
      displayCatPhoto(cats.payload);
    };
  }
}

function displayCatPhoto(url) {
  // console.log(url);
  let sectionForFoto = document.querySelector(".for-foto");
  sectionForFoto.textContent = "";
  if (url) {
    var photo = document.createElement("img");
    photo.setAttribute("src", url);
    sectionForFoto.appendChild(photo);
  }
}
