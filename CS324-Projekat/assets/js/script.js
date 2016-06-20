$(function() {
	
    /*
		U ovom kodu se desava sledece:

		1. Prihvata se slika po drag and drop funkciji
		2. Pravi se novi canvas element (original), sa maksimalnom
		velicinom od 1024*800 px (moze biti i fullHD slika 1980*1024) i cuva se u memoriji
		3. Ceka se korisnik da klinke na odredjeni filter. Kada je jedan selektovan:
				3.1 Napravi se kopija originalnog canvas elementa
				3.2 Obrisu se sve prethodne slike ukoliko postoje u aplikaciji
				3.3 Kopija canvas elementa se prosledi u #photo div
				3.4 Ako je korisnik selektovao bilo koji drugi filter sem "Normal"
					, pozvati Caman biblioteku.U suprotnom ne radi nista.
				3.5 Postavi odredjeni filter u "active" mod
		4. I na kraju vrati "Normal" filter

	*/

	var	maxWidth = 1024,
		maxHeight = 800,
		photo = $('#photo'),
		originalCanvas = null,
		filters = $('#filters li a'),
		filterContainer = $('#filterContainer');
		
    // Koristi se fileReader plugin za osluskivanje
	// file drag and drop funkcije na div photo:

	photo.fileReaderJS({
		on:{
			load: function(e, file){

               // Kada je slika ubacena pokrece se.

				var img = $('<img>').appendTo(photo),
					imgWidth, newWidth,
					imgHeight, newHeight,
					ratio;
					
                // Sklanja sve canvas elemente koji su ostali na aplikaciji
				// iz proslih drag/dropa pokusaja.
				
				photo.find('canvas').remove();
				filters.removeClass('active');
				
				// Kada se slika ubacila,
				// mozemo naci njenu visinu/sirinu:

				img.load(function() {

					imgWidth  = this.width;
					imgHeight = this.height;
					
					// Racunaju se nove dimenzije slike, tako da bi mogle
					// stati u maksimalnu dozvoljenu velicinu

					if (imgWidth >= maxWidth || imgHeight >= maxHeight) {

                        // Ako je slika previse velika,
						// smanjiti je da moze da stane u 1024*800!

						if (imgWidth > imgHeight) {

                            
							ratio = imgWidth / maxWidth;
							newWidth = maxWidth;
							newHeight = imgHeight / ratio;

						} else {


							ratio = imgHeight / maxHeight;
							newHeight = maxHeight;
							newWidth = imgWidth / ratio;

						}

					} else {
						newHeight = imgHeight;
						newWidth = imgWidth;
					}

                    // Napraviti originalan canvas.
					
					originalCanvas = $('<canvas>');
					var originalContext = originalCanvas[0].getContext('2d');

                    // Atributi za centriranje slike.

					originalCanvas.attr({
						width: newWidth,
						height: newHeight
					}).css({
						marginTop: -newHeight/2,
						marginLeft: -newWidth/2
					});
					
                    // Nacrtati sliku na canvas
					// sa novim dimenzijama.

					originalContext.drawImage(this, 0, 0, newWidth, newHeight);


					img.remove();

					filterContainer.fadeIn();

                    // Pokrece default "normal" filter
					filters.first().click();
				});


				img.attr('src', e.target.result);
			},

			beforestart: function(file){

                // Prihvata samo slike.
				// Pokazuje false ako nije u pitanju slika.

				return /^image/.test(file.type);
			}
		}
	});

	// Slusa promene filtera ukoliko postoje.
	
	filters.click(function(e){

		e.preventDefault();

		var f = $(this);

		if(f.is('.active')){
            // Prihvata promenu filtera samo jednom.
			return false;
		}

		filters.removeClass('active');
		f.addClass('active');

        // Klonira canvas
		var clone = originalCanvas.clone();
		
        // Klonira i sliku koja se nalazi u canvasu
		
		clone[0].getContext('2d').drawImage(originalCanvas[0],0,0);




		photo.find('canvas').remove().end().append(clone);

		var effect = $.trim(f[0].id);

		Caman(clone[0], function () {



			if( effect in this){
				this[effect]();
				this.render();

                // Pokazuje download dugme
				showDownload(clone[0]);
			}
			else{
				hideDownload();
			}
		});

	});
	
	
    // Koristi mousewheel plugin za skrolovanje po filterima
	filterContainer.find('ul').on('mousewheel',function(e, delta){

		this.scrollLeft -= (delta * 50);
		e.preventDefault();

	});

	var downloadImage = $('a.downloadImage');

	function showDownload(canvas){


		downloadImage.off('click').click(function(){
			
            // Kada je dugme Download pritisnuto
			// DataURL slike se stavlja u HREF:
			
			var url = canvas.toDataURL("image/png;base64;");
			downloadImage.attr('href', url);
			
		}).fadeIn();

	}

	function hideDownload(){
		downloadImage.fadeOut();
	}

});
