"use strict";

const list = document.querySelector(".nav");

fetchData("http://localhost:3000/cats", function(catsData) {
  buildListCats(catsData, list);
});

function fetchData(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.send();

  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) {
      return;
    }
    let catsData = xhr.responseText;
    try {
      catsData = JSON.parse(catsData);
    } catch {
      alert("Извините, в данных ошибка");
    }

    callback(catsData);
  };
}

function buildListCats(dataList, container) {
  container.textContent = "";
  const ulCats = document.createElement("ul");
  ulCats.classList.add("nav__list");

  dataList.forEach(element => {
    const liItem = document.createElement("li");
    liItem.classList.add("nav__item");
    const liReferense = document.createElement("a");
    liReferense.classList.add("nav__link");
    liReferense.setAttribute("href", "#");
    liReferense.setAttribute("data-id", element.id);
    liReferense.textContent = element.name;
    liItem.appendChild(liReferense);
    ulCats.appendChild(liItem);
  });

  container.appendChild(ulCats);

  const linCats = document.querySelector(".nav__list");
  linCats.addEventListener("click", function() {
    fetchData(
      "http://localhost:3000/cats/" + event.target.getAttribute("data-id"),
      function(catsData) {
        displayCatInfo(more, catsData);
        fetchData(
          "http://localhost:3000/threads/" + catsData.payload.threadId,
          function(catsData) {
            displayComments(placeForComment, catsData);
          }
        );
      }
    );

    fetchCatPhoto(event);
    currentItem(event);
  });

  function currentItem() {
    const anyLink = document.querySelectorAll(".nav__link");
    for (let i = 0; i < anyLink.length; i++) {
      let a = anyLink[i];
      a.classList.remove("actual");
    }

    event.target.classList.add("actual");
  }
}

const more = document.querySelector(".more");

function displayCatInfo(container, info) {
  container.textContent = "";
  const headName = document.createElement("h1");
  headName.textContent = info.payload.name;
  const pGender = document.createElement("p");
  pGender.textContent = convertGenderToString(info.payload.gender);
  const pAge = document.createElement("p");
  pAge.textContent = "Лет: " + info.payload.age;
  container.appendChild(headName, pGender, pAge);
  container.appendChild(pGender);
  container.appendChild(pAge);
}

function convertGenderToString(gender) {
  if (gender === "male") {
    return "Мальчик ";
  } else return "Девочка ";
}

const placeForComment = document.querySelector(".comments");

function displayComments(container, dataComments) {
  const listComments = dataComments.payload;
  container.textContent = "";

  const headerComments = document.createElement("h3");
  headerComments.textContent = "Коммментарии";
  container.append(headerComments);

  if (listComments === undefined || listComments.comments.length === 0) {
    makeDummyForComments(container);
    return;
  }

  listComments.comments.forEach(element => {
    const divCommment = document.createElement("div");
    divCommment.className = "comment__item";
    const autor = document.createElement("p");
    autor.className = "comment__author";
    autor.textContent = element.author;

    const textComment = document.createElement("p");
    textComment.className = "comment__text";
    textComment.textContent = element.content;
    divCommment.appendChild(autor);
    divCommment.appendChild(textComment);
    container.appendChild(divCommment);
  });
}

function makeDummyForComments(container) {
  const dummy = document.createElement("p");
  dummy.textContent = "Здесь еще нет ни одного комментария";
  dummy.className = "comment-text";
  container.append(dummy);
}

const sectionForFoto = document.querySelector(".userpic");

function fetchCatPhoto(event) {
  const xhr = new XMLHttpRequest();
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
    try {
      cats = JSON.parse(cats);
    } catch {
      cats = {};
    }

    displayCatPhoto(sectionForFoto, cats.payload);
  };
}

function displayCatPhoto(container, url) {
  container.textContent = "";
  if (url) {
    var photo = document.createElement("img");
    photo.setAttribute("src", url);
    photo.className = "userpic__image";
    container.appendChild(photo);
  }
}

const form = document.querySelector(".form");

form.addEventListener("submit", sendNewCat);

function sendNewCat() {
  event.preventDefault();
  const xhr = new XMLHttpRequest();
  const body = JSON.stringify({
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value
  });

  xhr.open("POST", "http://localhost:3000/cats");
  xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xhr.send(body);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) {
      return;
    }
    let newCat = xhr.responseText;

    try {
      newCat = JSON.parse(newCat);
    } catch {
      alert("Извините, в данных ошибка");
    }

    replyToUser(newCat, xhr.status);
  };
}

function replyToUser(answer, status) {
  if (status === 201) {
    alert(answer.payload);
  }

  if (status === 400) {
    alert("Проверьте адекватность введенных данных");
  }

  if (status == 406) {
    alert(answer.message);
  }
}
