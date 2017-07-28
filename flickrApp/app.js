(function () {

    function getPhotosForSearch(searchTerm) {
        var baseAPIURL = "http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&nojsoncallback=1&api_key=be7e284c7c8bc84c932bccd6c537f5b7&text=" //trashed API key :)

        var fullAPIURL = baseAPIURL + searchTerm;

        return (
            fetch(fullAPIURL)
                .then(response => response.json())
                .then(function (dataJSON) {
                    var photoJSONArray = dataJSON.photos.photo.map(function (photoItem) {
                        var itemTemp = {};
                        itemTemp.title = photoItem.title;
                        itemTemp.thumb = "https://farm" + photoItem.farm + ".staticflickr.com/" + photoItem.server + "/" + photoItem.id + "_" + photoItem.secret + "_t" + ".jpg";
                        itemTemp.large = "https://farm" + photoItem.farm + ".staticflickr.com/" + photoItem.server + "/" + photoItem.id + "_" + photoItem.secret + "_b" + ".jpg";
                        return itemTemp;
                    });
                    console.log(photoJSONArray);
                    return photoJSONArray;
                })
        );
    }

    function createFlickrThumb(photoData) {
        var link = document.createElement('a');
        link.setAttribute('href', photoData.large);
        link.setAttribute('target', '_blank');

        var image = document.createElement('img');
        image.setAttribute('src', photoData.thumb);
        image.setAttribute('alt', photoData.title);

        link.appendChild(image);

        return link; //returns AN ELEMENT WHICH YOU CAN APPEND
    }

    var containerPhotos = document.querySelector('.show-photos');
    var photoFormButton = document.querySelector('.photos-form');
    var photoInput = document.querySelector('.photos-input');
    photoFormButton.addEventListener('submit', function (event) {
        event.preventDefault();
        var searchValue = photoInput.value;
        getPhotosForSearch(searchValue)
            .then(function (photoArray) {
                photoArray.forEach(function (photoObj) {
                    containerPhotos.appendChild( createFlickrThumb(photoObj) );
                });
            });

    });

})();
