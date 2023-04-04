//load event fires, when the page HTML has loaded
window.addEventListener('load',() => { quizObject.init(); } );

const quizObject = {
    url :"https://www2.hs-esslingen.de/~melcher/internet-technologien/quiz/" ,
    token: null,
    themes : [],
    theme: null,
    chapters: [],
    chapter: null,
    quiz: null,
    summary: null,

    init(){
        const body = document.body;
        const page = this.makePage();
        body.appendChild(page);

        this.showStatePage("notLogedIn");

        
        
    },

    showStatePage(state){
        switch(state) {
            case "notLogedIn":
                this.loginPage();
                break;
            case "networkError":
                this.waitPage("Network Error, please reload");
                break;
            case "logginIn":
                this.waitPage("Loggin in");
                break;
            case "loginError":
                this.loginPage("Wrong user id or password");
                break;
            case "loadingThemes":
                this.waitPage("Loading Themes");
                break;
            case "selectTheme":
                this.themePage();
                break;
            case "loadingChapters":
                this.waitPage("Loading Chapters");
                break;
            case "selectChapter":
                this.themePage("Please select a chapter.");
                break;
            case "loadingQuiz":
                this.waitPage("Loading quiz");
                break;
            case "solveQuiz":
                this.quizPage();
                break;
            case "validatingAnswers":
                this.waitPage("Validating Answers");
                break;
            case "answerRight":
                this.resultPage(true);
                break;
            case "answerWrong":
                this.resultPage(false);
                break;
            case "loadingSummary":
                this.waitPage("Loading Summary");
                break;
            case "showPageSummary":
                this.summaryPage();
                break;
            default:
                alert("This can not happen");
        }
    },
    //Summary page
    summaryPage(){
        const total = this.summary.total;
        const known = this.summary.known;
        const failed = total - known;
        const perCentFailed = Math.round(failed / total * 100);

        const content = this.getEmptyContent();
        content.classList.add('summary');

        const summaryArea = this.createElement('div',['summaryArea']);
        content.appendChild(summaryArea);

        const summaryPie= this.createElement('div',['summaryPie']);
        summaryPie.style.background = `conic-gradient(rgb(126, 43, 32) 0% ${perCentFailed}%,rgb(4, 240, 110) 0% ${perCentFailed}%)`;
        summaryArea.appendChild(summaryPie);

        this.appendReplayButton();

        if(known){
            const divLeft = this.createElement('div',['summaryLabelLeft']);
            divLeft.innerText = known + " known";
            summaryPie.appendChild(divLeft);
        }

        if(failed){
            const divRight = this.createElement('div',['summaryLabelRight']);
            divRight.innerText = failed + " failed";
            summaryPie.appendChild(divRight);
        }

        const summeryTopics = this.createElement('div',['summerTopics']);
        summeryTopics.innerText = "Internert-Technologies";
        const summeryChapter = this.createElement('div',['summerChapter']);
        summeryChapter.innerText = "Basics";

        const contenContainer = document.getElementsByClassName('contentcontainer')[0];
        contenContainer.appendChild(summeryTopics);
        contenContainer.appendChild(summeryChapter);
    },
    appendReplayButton(){
        const replayButtonContainer = this.createElement('div',['ReplayButtonContainer']);
        const replayButton = this.makeButton("Replay");
        replayButton.classList.add('limiter');
        replayButton.addEventListener('click', ()=>{ this.quizReplay(event) })
        replayButtonContainer.appendChild(replayButton);

        const footer = document.getElementsByClassName('footer')[0];
        footer.parentNode.insertBefore(replayButtonContainer,footer);
    },
    //Result page
    resultPage(isAnswerCorrect){
        const content = this.getEmptyContent();
        content.classList.add('result');

        const result = this.pageResultContent(isAnswerCorrect);
        content.appendChild(result);
    },
    pageResultContent(isAnswerCorrect){
        const resultDiv = this.createElement('div',['resultArea']);
        const innerDiv = this.createElement('div',['resultMark',(isAnswerCorrect ? 'resultRight' : 'resultWrong')]);
        resultDiv.appendChild(innerDiv);

        this.appendResultControls(isAnswerCorrect);
        return resultDiv;
    },
    appendResultControls(isAnswerCorrect){
        const resultContainer = this.createElement('div');
        const resultControl = this.createElement('div',['resultControl','limiter']);
        resultContainer.appendChild(resultControl);

        const repeatButton = this.makeButton("Repeat");

        // if(!isAnswerCorrect){
            repeatButton.addEventListener('click', ()=>{ this.quizRepeat(event) });
        // }

        resultControl.appendChild(repeatButton);

        repeatButton.disabled = false;
        
        if(this.quiz.actual < this.quiz.total - 1){
            const nextButton = this.makeButton("Next");
            nextButton.addEventListener('click', ()=>{ this.quizNext(event) });
            resultControl.appendChild(nextButton);
        }else{
            const summaryButton = this.makeButton("Summary");
            summaryButton.addEventListener('click', ()=>{ this.quizSummary(event) });
            resultControl.appendChild(summaryButton);
        }

        const footer = document.getElementsByClassName('footer')[0];
        footer.parentNode.insertBefore(resultContainer,footer);

    },
    //Quiz page
    quizPage(){
        const content = this.getEmptyContent();
        const quiz = this.pageQuizContent();
        content.appendChild(quiz);
    },
    pageQuizContent(){
        const fieldset = this.createElement('fieldset',['fieldset','quiz']);

        let title = this.quiz.title;
        let question = this.quiz.question;
        let answers = this.quiz.answers;
        
        const legend = this.createElement('legend');
        legend.innerText = title;
        fieldset.appendChild(legend);

        fieldset.appendChild(this.makeH1(question));

        for(let i=0; i<answers.length;i++){
            fieldset.appendChild(this.makeQuestions(answers[i]));
        }

        const buttonContainer = this.createElement('div',['allignRight']);
        fieldset.appendChild(buttonContainer);
        const button = this.makeButton("Send");
        button.addEventListener('click',()=>{ this.validateAnswers() });
        buttonContainer.appendChild(button);

        return fieldset;

    },
    //Chapterbar page
    themePage(message){
        
        const content = this.getEmptyContent();
        this.addChapterBar();

        const actionMessage = this.createElement('div',['actionMessage']);
        actionMessage.innerText = message ? message: "Please select a Theme";
        
        content.appendChild(actionMessage);
    },
    addChapterBar(){
        const page = document.getElementsByClassName('page')[0];
        const main = document.getElementsByClassName('main')[0];

        const chapterbar = this.createElement('div',['chapterBar']);
        const chapterbarLimiter = this.createElement('div',['chapterBarLimiter']);
        chapterbar.appendChild(chapterbarLimiter);

        const themeSelect =  this.makeSelect('select-Theme','Theme', this.themes);
        themeSelect.addEventListener('change',()=>{ this.onThemeSelect(event); });
        
        chapterbarLimiter.appendChild(themeSelect);

        const chapterSelect = this.makeSelect('select-Chapter','Chapter',this.chapters);
        chapterSelect.addEventListener('change', ()=>{ this.onChapterSelect(event) });
        chapterbarLimiter.appendChild(chapterSelect);

        page.insertBefore(chapterbar,main);

    },
    //Wait Page
    waitPage(text)
    {
        const content = this.getEmptyContent();
        content.classList.add('waitscreen');

        const area = this.createElement('div',['waitscreenArea']);
        content.appendChild(area);
        
        const circle = this.createElement('div',['waitscreenCircle']);
        area.appendChild(circle);

        const textfield = this.createElement('div',['waitscreenText']);
        //check if argurment is undefined
        if(typeof text === 'undefined'){
            text = "Waiting";
            textfield.innerText = text;
        }else{
            textfield.innerText = text;
        }

        area.appendChild(textfield);
    },
    //Login Page
    loginPage(message){
        const content = this.getEmptyContent();
        const fieldset = this.pageLoginFieldset(message);

        content.appendChild(fieldset);
    },
    pageLoginFieldset(message){ 
        const fieldset = this.createElement('fieldset',['fieldset']);

        const legend = this.createElement('legend');
        legend.innerText = "Login";
        fieldset.appendChild(legend);

        const textFieldDiv = this.createElement('div');
        fieldset.appendChild(textFieldDiv);

        const inputName = this.makeInput('text', 'userid', 'User Id (>5 chars)',5);
        const inputPassword = this.makeInput('password', 'password', 'Password (>5 chars)',5); 

        
        //Lab 3
        if(message){
            const messageField = this.createElement('div');
            messageField.innerText = message;
            textFieldDiv.appendChild(messageField);
        }

        textFieldDiv.appendChild(inputName);
        textFieldDiv.appendChild(inputPassword);

        const buttonEnabler = ()=>{
            submitButton.disabled = !inputName.reportValidity() || !inputPassword.reportValidity();
        }

        inputName.addEventListener('input',buttonEnabler);
        inputPassword.addEventListener('input',buttonEnabler);

        const buttonDiv = this.createElement('div',['allignRight']);
        fieldset.appendChild(buttonDiv);

        const submitButton = this.makeButton("Login");
        buttonDiv.appendChild(submitButton);
        submitButton.disabled = true;

        submitButton.addEventListener('click', ()=>{ this.pageLoginSend(inputName.value, inputPassword.value) } );

        return fieldset;
    },

    //Make methods
    //generates the page, header main footer
    makePage(){
        const divPage = this.createElement('div',['page']);

        const header = this.makeHeader();
        divPage.appendChild(header);

        const main = this.makeMain();
        divPage.appendChild(main);

        const footer = this.makeFooter();
        divPage.appendChild(footer);

        return divPage;
    },

    //generate Header
    makeHeader(){
        const divHeader = this.createElement('div',['header']);
        const header = this.createElement('header',['limiter']);
        divHeader.appendChild(header);
        
        const h1 = this.createElement('h1');
        h1.innerText = "Quiz";
        header.appendChild(h1);

        const p = this.createElement('p');
        p.innerText = "by Phil Roth";
        header.appendChild(p);

        return divHeader;
    },

    //generate Main
    makeMain(){
        const divMain = this.createElement('div',['main','pagecontainer']);
        const main = this.createElement('main',['contentcontainer']);
        divMain.appendChild(main);
        const content = this.createElement('div',['content']);
        main.appendChild(content);
        
        return divMain;
    },

    //generate Footer
    makeFooter(){
        const divFooter = this.createElement('div',['footer']);

        const footer = this.createElement('footer', ['limiter']);
        footer.innerHTML = "Copyright &copy; 2021 by Phil Roth";
        divFooter.appendChild(footer);

        return divFooter;
    },
    //generate Input
    makeInput(type, name, placeholderText, minimunLength){
        const input = this.createElement('input');
        input.type = type;
        input.name = name;
        input.placeholder = placeholderText;
        input.minLength = minimunLength;
        input.required = true;
        return input;
    },
    //belongs to chapterbar page
    makeSelect(selectId,selectTitle,secletTopicList){
        const select = this.createElement('select');
        select.id = selectId;

        const titleValue = this.createElement('option');
        titleValue.innerText = selectTitle;
        titleValue.value= ""; 
        titleValue.disabled = "disabled"; 
        titleValue.selected = "selected";
        select.appendChild(titleValue);

        for (let i=0; i<secletTopicList.length;i++) {
            const optionValue1 = document.createElement('option');
            optionValue1.value = secletTopicList[i].id;
            optionValue1.innerText = secletTopicList[i].name;
            select.appendChild(optionValue1);
        }
        
        return select;
    },
    //belongs to quiz
    makeH1(header){
      const h1 = this.createElement('h1');
      h1.innerText = header;

      return h1;
    },
    makeQuestions(answer){
        const div = this.createElement('div',['quizQuestions']);
        const input = this.createElement('input');
        div.appendChild(input);
        input.id = answer.id;
        input.type = "checkbox";
        div.innerHTML += answer.text;
        
        return div;
    },
    //belongs to login,quiz,result
    makeButton(buttonText){
        const button = this.createElement('input');
        button.type = "submit";
        button.value = buttonText;

        return button;
    },

    //belongs to login Page
    getEmptyContent(){
       
        let content = document.getElementsByClassName('content')[0];
        if(content) content.remove();
        const div = this.createElement('div',['content']);
        const parent = document.getElementsByClassName('contentcontainer')[0];
        parent.appendChild(div);

        this.removeElementsOfClass('chapterBar');
        this.removeElementsOfClass('summerTopics');
        this.removeElementsOfClass('summerChapter');
        this.removeElementsOfClass('resultControl');
        this.removeElementsOfClass('ReplayButtonContainer');

        return div;
    },
    //remove stacked elements
    removeElementsOfClass(elements){
        const elementsToRemove = document.getElementsByClassName(elements);
        while(elementsToRemove.length > 0){
            elementsToRemove[0].parentNode.removeChild(elementsToRemove[0]);
        }
    },
    //own createElement method
    createElement(tag, classNames){
        const element = document.createElement(tag);
        
        if(classNames){
            for(const name of classNames){
                element.classList.add(name);
            }
        }

        return element;
    
    },
    //Lab 3 changes
    pageLoginSend(userId, password){
        this.showStatePage("logginIn")

        fetch(this.url + `?request=login&userid=${userId}&password=${password}`).then(response => {
            response.json().then(data =>
            {
                if(data.status.error) {
                    this.showStatePage("loginError");
                }else{
                    this.token = data.token;
                    this.loadThemes();
                }
            })
        }).catch(error => {
            this.showStatePage("loginError");
        });
    },
    loadThemes(){
        this.showStatePage("loadingThemes");

        fetch(this.url + `?request=getthemes&token=${this.token}`).then(response => {
                response.json().then(data =>{
                this.themes = data.themes;
                // console.log(this.themes);
                this.showStatePage("selectTheme");
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });
    },
    onThemeSelect(selection){
        this.theme = selection.srcElement.value;
        this.showStatePage("loadingChapters");

        fetch(this.url + `?request=gettheme&theme=${this.theme}&token=${this.token}`).then(response => {
                response.json().then(data =>{
                this.chapters = data.chapters;
                // console.log(this.chapters);
                this.showStatePage("selectChapter");
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });
    },

    onChapterSelect(selection){
        this.chapter = selection.srcElement.value;
        this.showStatePage("loadingQuiz");

        fetch(this.url + `?request=getquiz&theme=${this.theme}&chapter=${this.chapter}&token=${this.token}`).then(response => {
                response.json().then(data =>{
                this.quiz = data.quiz;
                this.showStatePage("solveQuiz");
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });

    },
    validateAnswers(){
        const checkedElements = document.querySelectorAll("input[type=checkbox]:checked");
        const checkedAnswers = Array.from(checkedElements).map(node => node.id).join(",");
        //console.log(checkedAnswers);
        this.showStatePage("validatingAnswers");

        fetch(this.url + `?request=validateanswer&selected=${checkedAnswers}&token=${this.token}`).then(response => {
                response.json().then(data =>{
                    //console.log(data);
                if(data.decision)
                {
                    this.showStatePage("answerRight");
                }else{
                    this.showStatePage("answerWrong")
                }
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });
    },
    quizRepeat(event){
        this.showStatePage("loadingQuiz");

        fetch(this.url + `?request=getsamequiz&token=${this.token}`).then(response => {
                response.json().then(data =>{
                    console.log();
                    this.quiz = data.quiz;
                    this.showStatePage("solveQuiz");
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });
    },
    quizNext(event){
        this.showStatePage("loadingQuiz");

        fetch(this.url + `?request=getnextquiz&token=${this.token}`).then(response => {
                response.json().then(data =>{
                    //console.log(data);
                    this.quiz = data.quiz;
                    this.showStatePage("solveQuiz");
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });
    },
    quizSummary(event){
        this.showStatePage("loadingSummary");

        fetch(this.url + `?request=getsummary&token=${this.token}`).then(response => {
                response.json().then(data =>{
                    this.summary = {known: data.known, total: data.total};
                    this.showStatePage("showPageSummary");
                    //console.log(data);
            })
        }).catch(error => {
            this.showStatePage("networkError");
        });
    },
    quizReplay(event){
        this.showStatePage("selectTheme");
    }
};