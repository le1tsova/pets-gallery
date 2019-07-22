"use strict";

const BASE_URL = "http://localhost:3000/";
const CATS_URL = `${BASE_URL}cats/`;
const THREADS_URL = `${BASE_URL}threads/`;

function fetchData(url, options = {}) {
  const { method = "GET", headers, body } = options;
  return new Promise(function fetchDataExecutor(resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url);

    if (headers) {
      Object.keys(headers).forEach(header => {
        xhr.setRequestHeader(header, headers[header]);
      });
    }

    xhr.onerror = function(e) {
      reject(e);
    };

    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) {
        return;
      }
      let data = xhr.responseText;
      try {
        data = JSON.parse(data);
        resolve([data, xhr.status]);
      } catch {
        reject(xhr.status);
      }
    };

    xhr.send(body);
  });
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

function displayComments(container, response) {
  container.textContent = "";

  const headerComments = document.createElement("h3");
  headerComments.textContent = "Комментарии";
  container.appendChild(headerComments);

  if (!response || response.error) {
    makeDummyErr(container);
    return;
  }

  if (!response.payload.comments.length) {
    makeDummyForComments(container);
    return;
  }

  response.payload.comments.forEach(comment => {
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

function displayCatPhoto(container, response) {
  container.textContent = "";

  if (!response || response.error) return;

  const photo = document.createElement("img");
  photo.setAttribute("src", response.payload);
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
    const catId = event.target.getAttribute("data-id");

    fetchData(CATS_URL + catId)
      .then(function(data) {
        const [response] = data;
        displayCatInfo(more, response);
        return response.payload.threadId;
      })
      .catch(function() {
        displayCatInfo(more, undefined);
        return Promise.reject();
      })
      .then(threadId => fetchData(THREADS_URL + threadId))
      .then(data => displayComments(commentPlace, data[0]))
      .catch(() => displayComments(commentPlace, undefined));

    fetchData(CATS_URL + "photo/" + catId, {
      headers: {
        "x-api-key": "vzuh"
      }
    })
      .then(data => displayCatPhoto(sectionFoto, data[0]))
      .catch(() => displayCatPhoto(sectionFoto, undefined));

    setCurrentItem(event.target);
  });
}

const navigationMenu = document.querySelector(".nav");

fetchData(CATS_URL)
  .then(data => buildListCats(data[0], navigationMenu))
  .catch(() => buildListCats(undefined, navigationMenu));

function replyToUser(answer, status) {
  if (!answer) {
    alert("Извините, ничего не разобрать, но есть код: " + status);
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
      alert(
        "Извините, другого ответа у нас для вас нет: " +
          answer +
          ". Код: " +
          status
      );
  }
}

const form = document.querySelector(".form");

function sendNewCat(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;

  if (!name || !age) {
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

  const body = JSON.stringify({
    name: name,
    age: age,
    gender: document.getElementById("gender").value
  });

  return fetchData(CATS_URL, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=utf-8"
    },
    body: body
  });
}

form.addEventListener("submit", function() {
  sendNewCat(event)
    .then(data => replyToUser(...data))
    .catch(status => replyToUser(undefined, status));
});
