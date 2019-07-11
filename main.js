"use strict";

function fetchData(url, headers) {
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    if (headers) {
      Object.keys(headers).forEach(header => {
        xhr.setRequestHeader(header, headers[header]);
      });
    }

    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) {
        return;
      }
      let data = xhr.responseText;
      try {
        data = JSON.parse(data);
        resolve(data);
      } catch {
        
        reject();
      }
    };
    xhr.send();
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

function displayComments(container, dataComments) {
  container.textContent = "";

  const headerComments = document.createElement("h3");
  headerComments.textContent = "Комментарии";
  container.appendChild(headerComments);

  if (!dataComments || dataComments.error) {
    makeDummyErr(container);
    return;
  }

  if (!dataComments.payload.comments.length) {
    makeDummyForComments(container);
    return;
  }

  dataComments.payload.comments.forEach(comment => {
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

function displayCatPhoto(container, photoData) {
  container.textContent = "";

  if (!photoData || photoData.error) return;

  const photo = document.createElement("img");
  photo.setAttribute("src", photoData.payload);
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

    fetchData("http://localhost:3000/cats/" + catId)
      .then(function(data) {
        displayCatInfo(more, data);
        return data.payload.threadId;
      })
      .catch(function() {
        displayCatInfo(more, undefined);
        Promise.reject();
      })
      .then(function(threadId) {
        return fetchData("http://localhost:3000/threads/" + threadId);
      })
      .then(function(data) {
        displayComments(commentPlace, data);
      })
      .catch(displayComments(commentPlace, undefined));

    fetchData("http://localhost:3000/cats" + "/photo/" + catId, {
      "x-api-key": "vzuh"
    })
      .then(data => displayCatPhoto(sectionFoto, data))
      .catch(displayCatPhoto(sectionFoto, undefined));

    setCurrentItem(event.target);
  });
}

const navigationMenu = document.querySelector(".nav");

fetchData("http://localhost:3000/cats")
  .then(data => buildListCats(data, navigationMenu))
  .catch(buildListCats(undefined, navigationMenu));

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

  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    const body = JSON.stringify({
      name: name,
      age: age,
      gender: document.getElementById("gender").value
    });
    xhr.open("POST", "http://localhost:3000/cats");
    xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      let newCat = xhr.responseText;
      try {
        newCat = JSON.parse(newCat);
        resolve([newCat, xhr.status]);
      } catch {
        reject(xhr.status);
      }
    };
    xhr.send(body);
  });
}

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

form.addEventListener("submit", function(event) {
  sendNewCat(event)
    .then(data => replyToUser(data[0], data[1]))
    .catch(status => replyToUser(undefined, status));
});
