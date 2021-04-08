<script>
    export let title;
    export let body;
    export let reverse = false;
    export let src;
    export let alt = "";
</script>

<div class="w-full flex flex-wrap items-center shadow-md  px-9 py-8 rounded-2xl  mb-6 md:mb-12 xl:mb-16" class:flex-row-reverse={reverse}>
    <div class="w-full md:w-1/2">
        <img class="w-full object-contain" {src} {alt}/>
    </div>
    <div class="w-full mt-8 md:w-1/2 md:mt-0 md:px-9">
        <h2 class="text-secondary-200 text-xl font-primary font-bold text-center md:text-left lg:text-2xl">{title}</h2>
        <p class="mt-6 text-lg text-center md:text-left text-secondary-300">{body}</p>
    </div>
</div>
