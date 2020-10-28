const siteURL = location.href;

let loading = false;

let query = null;

var form = document.getElementById('search-form');
form.addEventListener('submit', function (evt) {
    evt.preventDefault();

    query = document.search.query.value.trim();
    if (!loading && query != "") {
        loading = true;
        startSpinner();
        hideResultBlocks();
        sendRequest({"query":query});
    }
});



function sendRequest(request, character=None) {
    $.ajax({type: "post",
            contentType: 'application/json',
            dataType: "json",
            data: JSON.stringify(request),
            url: 'https://asia-northeast2-yuyuyui-script-search-20200915.cloudfunctions.net/lookup'})
    .done(function(response) {
        try {
            fillResultBlocks(response);
            fillCharacterCounts(response);
        } catch (error) {
            alert("応答の処理中にエラーが発生しました。");
        }
    })
    .fail(function(jqXHR, textStatus) {
        if (jqXHR.status == 400) {
            alert("検索文字列が読み取れませんでした。");
        }
        if (jqXHR.status == 404) {
            alert("候補が見つかりませんでした。");
        }
    })
    .always(function() {
        loading = false;
        stopSpinner();
    })

}

function fillResultBlocks(response) {
    let totalCount = response["total_count"];
    document.getElementById("result-totalcount").textContent = totalCount.toString();
    document.getElementById("result-totalcount-block").style.display = "block";

    let results = response["results"];
    let resultBlocks          = document.getElementsByClassName("result-block");
    let characterContainers   = document.getElementsByClassName("result-character");
    let textContainers        = document.getElementsByClassName("result-text");
    let metaContainers        = document.getElementsByClassName("result-meta");
    let tweetLink             = document.getElementsByClassName("tweet-button-a");
    for (let i = 0; i < results.length; i++) {
        const character = results[i][0];
        const text      = results[i][1];
        const metaList  = results[i][2];
        const meta = metaList.reduce(
            (accum, m) =>
            accum + '<li class="breadcrumb-item">' + m + '</li>',
            '');
        const teweetText = character + "「" + text + "」\n―" + metaList.join("/") + "\n";
        const tweetHref = "https://twitter.com/intent/tweet?original_referer=" + encodeURI(siteURL)
            + "&ref_src=twsrc%5Etfw&text=" + encodeURI(teweetText) + "&tw_p=tweetbutton&url=" + encodeURI(siteURL);
        characterContainers[i].textContent = character;
        textContainers[i]     .textContent = text;
        metaContainers[i]     .innerHTML   = meta;
        tweetLink[i]          .href        = tweetHref;
        resultBlocks[i].style.display = "block";
    }
}

function fillCharacterCounts(response) {
    chara_count_list = response["character_counts"];
    let inner_html = ""
    for (let i = 0; i < chara_count_list.length; i++) {
        const chara  = chara_count_list[i][0];
        const count = chara_count_list[i][1];
        inner_html += '<div type="button" onclick="onCharaClick(evt)" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 result-characounts-item"><span class="result-characounts-text">' + chara + '</span><span class="badge badge-secondary">' + count + '</span></div>';
    }
    $("#result-characounts-list")[0].innerHTML = inner_html;
}

function onCharaClick(evt) {
    sender = evt.target;
    let character = sender.getElementsByClassName("result-characounts-text").innerText;

    if (!loading) {
        loading = true;
        startSpinner();
        hideResultBlocks();
        sendRequest({"query":query, "character":character});
    }
}

function startSpinner() {
    document.getElementById('search-button-text').style.display = "none";
    document.getElementById('search-button-spinner').style.display = "block";
}

function stopSpinner() {
    document.getElementById('search-button-text').style.display = "inline";
    document.getElementById('search-button-spinner').style.display = "none";
}

function hideResultBlocks() {
    document.getElementById("result-totalcount-block").style.display = "none";

    let resultBlocks = document.getElementsByClassName("result-block");
    Array.from(resultBlocks).forEach(element => {
        element.style.display = "none";
    });
}