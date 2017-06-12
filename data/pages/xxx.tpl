
<!--
	id : pageHeader
	le template "pageHeader" est template spécifique
	qui ajoute des éléments à la balise <header> de la page
-->
<template id="pageHeader">
<title>{$title}</title>
<link rel="icon" type="image/png" href="medias/favicon.png"/>
<link rel="shortcut icon" type="image/x-icon" href="medias/favicon.ico"/>
</template>


<!--
	id : nom du bundle (ici xxx)
	type : type de contenu (ici markdown) [default:xml]
	Ce template ayant le nom de la page va être ajouté à
	la basie <body> de la page
-->
<template id="xxx" type="markdown">

# {$title}


</template>
