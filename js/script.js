var app = {
    init: function () {
        this.showLoader();
        this.cacheElements();
        this.countriesAPI().then(() => {
            this.bindListeners();
            this.hideLoader();
        });
        
    },
    cacheElements: function (param) {  
        this.countriesCarousel = $(".grid")[0];
    },
    countriesAPI: async function () {
        var template = `
        <div class="item" data-index="{{index}}">
                <div class="item-image">
                    <img src="{{flag}}" alt="">
                </div>
                <div class="item-content">
                    <p class="item-content-title">
                        {{name}}
                    </p>
                    <p class="item-content-description">
                        {{capital}}
                    </p>
                </div>
            </div>
            `;
        var carousel = $(this.countriesCarousel);
        await $.get("https://restcountries.com/v3.1/all", {},
            (data, textStatus, jqXHR) => {
                this.countriesData = data;
                data.map((country, i) => {
                    var object = {};
                    object["name"] = country.name.official;
                    object["flag"] = country.flags.png;
                    object["capital"] = country.capital?.[0];
                    object["index"] = i;
                    var text = Mustache.render(template, object);
                    carousel.append(text);
                })
                
            },
            "json"
        );
    },
    bindListeners: function () {  
        var context = this;

        $('.item').each(function () {
            var $this = $(this);
            $this.on("click", function () {
                context.currentCountry = context.countriesData[$this.data('index')];
                context.renderCurrentCountry();
                context.fetchNews();
            });
        });
    },
    renderCurrentCountry: function (param) {
        var timezone = "";
        this.currentCountry.timezones.map((t) => timezone += t + " ")

        var object = {
            name: this.currentCountry.name.official,
            flag: this.currentCountry.flags.png,
            capital: this.currentCountry.capital?.[0],
            currency: this.currentCountry.currencies[Object.keys(this.currentCountry.currencies)[0]].name,
            language: this.currentCountry.languages[Object.keys(this.currentCountry.languages)[0]],
            population: this.currentCountry.population,
            subregion: this.currentCountry.subregion,
            timezone,
        }
        var template = `
            <div>
                <img src="{{flag}}" width="150px">
            </div>
            <div class="">
                <p class="selected-country-title">
                    {{name}}
                </p>
                <p class="selected-country-text">
                    Capital: {{capital}}
                </p>
                <p class="selected-country-text">
                    Currency: {{currency}}
                </p>
                <p class="selected-country-text">
                    Language: {{language}}
                </p>
                <p class="selected-country-text">
                    Population: {{population}}
                </p>
                <p class="selected-country-text">
                    Subregion: {{subregion}}
                </p>
                <p class="selected-country-text">
                    Timezone: {{timezone}}
                </p>
            </div>
            `;
        var text = Mustache.render(template, object);

        $(".country-details").html(text);
        $(".country-details").removeClass("hide");
    },
    fetchNews: async function () {

        var newsContainer = $(".news-container");
        newsContainer.html("");
        this.showLoader();
        var template = `
            <div class="news-item">
                <div class="news-item-image">
                    <img src="{{image}}" width="100%">
                </div>
                <div class="news-data">
                    <p class="selected-country-title news-title">
                        {{title}}
                    </p>
                    <p class="news-description">
                        {{description}}
                    </p>

                    <p class="news-description right">
                        {{author}}
                    </p>
                    <p class="news-description right">
                        {{date}}
                    </p>
                </div>
            </div>
            `;

        await $.get(`https://newsapi.org/v2/everything?q=${this.currentCountry.name.official}&apiKey=27458c0ef963476f862ac23386af41c8`, {},
        (data, textStatus, jqXHR) => {
            var news = "";
            data.articles.map((newsItem, i) => {
                let date = new Date(newsItem.publishedAt);
                var object = {};
                object["title"] = newsItem.title;
                object["description"] = newsItem.description;
                object["image"] = newsItem.urlToImage;
                object["index"] = i;
                object["author"] = newsItem.source.name;
                object["date"] = date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear();

                var text = Mustache.render(template, object);
                news += text;
            })
            
            newsContainer.html(news);
            this.hideLoader();
        },
        "json"
    );
    },
    showLoader: function () {
        $(".loader").removeClass("hide");
    },
    hideLoader: function () {
        $(".loader").addClass("hide");
    }
}

app.init();