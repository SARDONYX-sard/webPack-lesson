setTimeout(() => {
    import("@scss/app");
}, 2000);
import "regenerator-runtime/runtime";
import "core-js/configurator";

const init = async () => {
    console.log("this is a main js file.");
    await asyncFn();
    jQuery();
    utils.log("hello from app.js");
};

async function asyncFn() {
    console.log("Async Function called.");
}
init();
