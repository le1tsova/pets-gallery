"use strict";

function fetchData(url, callback, header) {
  const options = {
    method: "GET"
  };

  if (header) {
    options.headers = header;
  }

  fetch(url, options)
    .then(response => response.json())
    .then(data => callback(data))
    .catch(() => callback(undefined));
}

function makeDummyErr(container) {
  const dummy = document.createElement("p");

  dummy.textContent = "Извините, ошибка в данных";
  dummy.className = "dummy--error";
  container.append(dummy);
}

function convertGenderToString(gender) {
  return gender === "male" ? "Мальчик" : "Девочка";
}

function displayCatInfo(container, info) {
  container.textContent = "";

  if (!info) {
    makeDummyErr(container);
    return;
  }

  const headName = document.createElement("h1");
  headName.textContent = info.payload.name;
  const pGender = document.createElement("p");
  pGender.textContent = convertGenderToString(info.payload.gender);
  const pAge = document.createElement("p");
  pAge.textContent = "Лет: " + info.payload.age;
  container.appendChild(headName);
  container.appendChild(pGender);
  container.appendChild(pAge);
}

function makeDummyForComments(container) {
  const dummy = document.createElement("p");
  dummy.textContent = "Здесь еще нет ни одного комментария";
  dummy.className = "dummy";
  container.appendChild(dummy);
}

function displayComments(container, dataComments) {
  container.textContent = "";

  const headerComments = document.createElement("h3");
  headerComments.textContent = "Комментарии";
  container.appendChild(headerComments);

  if (!dataComments.payload) {
    makeDummyErr(container);
    return;
  }

  const listComments = dataComments.payload;

  if (!listComments.comments.length) {
    makeDummyForComments(container);
    return;
  }

  listComments.comments.forEach(comment => {
    const divCommment = document.createElement("div");
    divCommment.className = "comment__item";
    const autor = document.createElement("p");
    autor.className = "comment__author";
    autor.textContent = comment.author;

    const textComment = document.createElement("p");
    textComment.className = "comment__text";
    textComment.textContent = comment.content;
    divCommment.appendChild(autor);
    divCommment.appendChild(textComment);
    container.appendChild(divCommment);
  });
}

function displayCatPhoto(container, url) {
  container.textContent = "";

  if (!url.payload) return;

  const photo = document.createElement("img");
  photo.setAttribute("src", url.payload);
  photo.className = "userpic__image";
  container.appendChild(photo);
}

function setCurrentItem(clickedLink) {
  const navigationLinks = document.querySelectorAll(".nav__link");

  navigationLinks.forEach(link => {
    link.classList.remove("actual");
  });

  clickedLink.classList.add("actual");
}

const more = document.querySelector(".more");
const commentPlace = document.querySelector(".comments");
const sectionFoto = document.querySelector(".userpic");

function buildListCats(dataList, container) {
  container.textContent = "";

  if (!dataList) {
    makeDummyErr(container);
    return;
  }

  const ulCats = document.createElement("ul");
  ulCats.classList.add("nav__list");

  dataList.forEach(cat => {
    const liItem = document.createElement("li");
    liItem.classList.add("nav__item");
    const liReferense = document.createElement("a");
    liReferense.classList.add("nav__link");
    liReferense.setAttribute("href", "#");
    liReferense.setAttribute("data-id", cat.id);
    liReferense.textContent = cat.name;
    liItem.appendChild(liReferense);
    ulCats.appendChild(liItem);
  });

  container.appendChild(ulCats);

  ulCats.addEventListener("click", function(event) {
    fetchData(
      "http://localhost:3000/cats/" + event.target.getAttribute("data-id"),

      function(catsData) {
        displayCatInfo(more, catsData);
        fetchData(
          "http://localhost:3000/threads/" + catsData.payload.threadId,
          function(catsData) {
            displayComments(commentPlace, catsData);
          }
        );
      }
    );

    fetchData(
      "http://localhost:3000/cats" +
        "/photo/" +
        event.target.getAttribute("data-id"),
      function(catsData) {
        displayCatPhoto(sectionFoto, catsData);
      },
      {
        "x-api-key": "vzuh"
      }
    );

    setCurrentItem(event.target);
  });
}

const navigationMenu = document.querySelector(".nav");

fetchData("http://localhost:3000/cats", function(catsData) {
  buildListCats(catsData, navigationMenu);
});

function replyToUser(answer, status) {
  if (!answer) {
    alert("Извините, в данных ответа ошибка");
    return;
  }
  switch (status) {
    case 201:
      alert(answer.payload);
      break;
    case 400:
      alert("Проверьте адекватность введенных данных");
      break;
    case 406:
      alert(answer.message);
      break;
    default:
      alert("Код ответа: " + status);
  }
}

function sendNewCat(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;

  if (name === "" || age === "") {
    alert("В огороде пусто, выросла капуста!");
    return;
  }

  if (/[^а-яё]+/gi.test(name)) {
    alert("Только кириллица!");
    return;
  }
  if (age > 38) {
    alert("Стока не живут!");
    return;
  }

  fetch("http://localhost:3000/cats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      age: age,
      gender: document.getElementById("gender").value
    })
  })
    .then(response => {
      response.json().then(data => {
        replyToUser(data, response.status);
      });
    })
    .catch(() => replyToUser(undefined));
}
const form = document.querySelector(".form");

form.addEventListener("submit", sendNewCat);
