(function logBanner() {
  var line =
    "===============================================================";
  var titleStyle =
    "font-size:20px;font-weight:bold;color:#d43f3a;padding:6px 0;";
  var textStyle =
    "font-size:13px;color:#444;line-height:1.6;";
  var linkStyle =
    "font-size:13px;color:#0b73ec;text-decoration:underline;";

  console.warn("%c我错了哥❤", titleStyle);
  console.log(
    "%c我们是普通学生开发者，正在学习和成长。\n" +
      "请不要尝试攻击或破坏本站。\n" +
      "如果发现 bug，欢迎向我们反馈，感谢支持！\n" +
      "如果你对其中的技术感兴趣，也欢迎来与我们交流!",
    textStyle
  );
  console.log(
    "%c反馈请加微信: wang2652130730",
    linkStyle
  );
  console.log(line);
})();
