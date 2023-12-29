"use strict";
const wrapper = document.querySelector(".wrapper"), searchInput = wrapper.querySelector("input"), searchBtn = document.querySelector(".search button"), volume = wrapper.querySelector(".word i"), infoText = wrapper.querySelector(".info-text"), synonyms = wrapper.querySelector(".synonyms "), synonymsList = wrapper.querySelector(".synonyms .list"), removeIcon = wrapper.querySelector(".search span"), wordP = document.querySelector(".word p"), wordSpan = document.querySelector(".word span"), meaning = document.querySelector(".meaning span"), exampleContainer = document.querySelector(".example"), example = document.querySelector(".example span");
let audio;
function loadValues(e) {
    let word = searchInput.value.replace(/\s+/g, ' ');
    if (word === "" || word == null || word.trim() == '')
        return null;
    if (e.key === "Enter" || e.target.id === 'searchButton') {
        fetchApi(word);
    }
}
function fetchApi(word) {
    wrapper.classList.remove("active");
    reset();
    infoText.style.color = "#000";
    infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    fetch(url)
        .then(response => response.json())
        .then(result => data(result, word))
        .catch(() => {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    });
}
function data(result, word) {
    if (result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    }
    else {
        wrapper.classList.add("active");
        let correctSrcAudio = result[0].phonetics.filter((e) => e.text && e.audio)[0], definitions = result[0].meanings[0].definitions[0], allSynonyms = definitions.synonyms.filter((element) => element !== undefined);
        wordP.innerText = `${result[0].word}`;
        if (correctSrcAudio) {
            volume.style.display = "block";
            let phonetics = `${result[0].meanings[0].partOfSpeech}  /${correctSrcAudio.text}/`;
            wordSpan.innerText = `${phonetics}`;
            audio = new Audio(correctSrcAudio.audio);
        }
        else {
            volume.style.display = "none";
            let phonetics = `${result[0].meanings[0].partOfSpeech}  /${result[0].phonetic}/`;
            wordSpan.innerText = `${phonetics}`;
        }
        meaning.innerText = `${definitions.definition}`;
        if (definitions.example) {
            exampleContainer.style.display = "block";
            example.innerText = `${definitions.example}`;
        }
        else {
            exampleContainer.style.display = "none";
        }
        if (allSynonyms.length == 0) {
            synonyms.style.display = "none";
        }
        else {
            synonyms.style.display = "block";
            synonymsList.innerHTML = "";
            for (let i = 0; i < allSynonyms.length; i++) {
                let tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[i]},</span>`;
                tag =
                    i == (allSynonyms.length - 1)
                        ?
                            tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[(allSynonyms.length - 1)]}</span>`
                        :
                            tag;
                synonymsList.insertAdjacentHTML("beforeend", tag);
            }
        }
    }
}
function search(word) {
    searchInput.value = word;
    fetchApi(word);
}
function reset() {
    audio = new Audio();
    wordP.innerText = "";
    wordSpan.innerText = "";
    synonymsList.innerHTML = "";
    meaning.innerText = "";
    example.innerText = "";
}
volume.addEventListener("click", () => {
    volume.style.color = "#fb4c5f";
    audio.play();
    setTimeout(() => {
        volume.style.color = "#999";
    }, 800);
});
removeIcon.addEventListener("click", () => {
    reset();
    searchInput.value = "";
    searchInput.focus();
    wrapper.classList.remove("active");
    infoText.style.color = "#9A9A9A";
    infoText.innerHTML = "Type any existing word and press enter to get meaning, example, synonyms, etc.";
});
searchInput.addEventListener("keyup", loadValues);
searchBtn.addEventListener("click", loadValues);
