const quill = new Quill("#editor", {
  theme: "snow",
});

quill.on("text-change", () => {
  console.log(quill.getText());
});
