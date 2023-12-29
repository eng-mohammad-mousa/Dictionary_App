const
    wrapper = document.querySelector(".wrapper") as HTMLElement,

    searchInput = wrapper.querySelector("input") as HTMLInputElement,
    searchBtn = document.querySelector(".search button") as HTMLElement,

    volume = wrapper.querySelector(".word i") as HTMLElement,
    infoText = wrapper.querySelector(".info-text") as HTMLElement,

    synonyms = wrapper.querySelector(".synonyms ") as HTMLElement,
    synonymsList = wrapper.querySelector(".synonyms .list") as HTMLElement,

    removeIcon = wrapper.querySelector(".search span") as HTMLElement,

    wordP = document.querySelector(".word p") as HTMLElement,
    wordSpan = document.querySelector(".word span") as HTMLElement,
    meaning = document.querySelector(".meaning span") as HTMLElement,
    exampleContainer = document.querySelector(".example") as HTMLElement,
    example = document.querySelector(".example span") as HTMLElement;

let audio: any;


function loadValues(e: any): null | undefined {
    // Remove any excess spaces found and replace them with just one.
    let word: string = searchInput.value.replace(/\s+/g, ' ');

    if (word === "" || word == null || word.trim() == '') return null;

    if (e.key === "Enter" || e.target.id === 'searchButton') {
        fetchApi(word);
    }
}

function fetchApi(word: string) {

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


function data(result: any, word: string): void {

    if (result.title) {
        infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;

    } else {

        wrapper.classList.add("active");


        let
            // here there is a problem in api: it return sometime array with multi values how to pronunciation word without audio
            // so we add this line to take the first pronunciation & audio
            correctSrcAudio: any = result[0].phonetics.filter((e: any) => e.text && e.audio)[0],

            definitions: any = result[0].meanings[0].definitions[0],
            allSynonyms: string[] = definitions.synonyms.filter((element: any) => element !== undefined);


        // 0 - Word
        wordP.innerText = `${result[0].word}`;

        // 1 - pronunciation &  audio 
        if (correctSrcAudio) {
            volume.style.display = "block";

            let phonetics: string = `${result[0].meanings[0].partOfSpeech}  /${correctSrcAudio.text}/`;
            wordSpan.innerText = `${phonetics}`;

            audio = new Audio(correctSrcAudio.audio);

        } else {
            volume.style.display = "none";

            let phonetics: string = `${result[0].meanings[0].partOfSpeech}  /${result[0].phonetic}/`;
            wordSpan.innerText = `${phonetics}`;

        }

        // 2 - meaning
        meaning.innerText = `${definitions.definition}`;
        
        // 3 - example
        if (definitions.example) {
            exampleContainer.style.display = "block";
            example.innerText = `${definitions.example}`;
        } else {
            exampleContainer.style.display = "none";
        }

        // 4 - Synonyms
        if (allSynonyms.length == 0) {
            synonyms.style.display = "none";
        } else {

            synonyms.style.display = "block";
            synonymsList.innerHTML = "";

            for (let i = 0; i < allSynonyms.length; i++) {
                let tag =
                    `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[i]},</span>`;

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

function search(word: string) {
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