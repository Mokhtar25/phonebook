function val(p) {
  try {
    let [x, y] = p.split("-");
    console.log(x, y);
    if (x.toString().length > 3 || x.toString().length === 0) {
      console.log("a");
      return false;
    }
    if (y.toString().length < 2) {
      console.log("ta");
      return false;
    }
  } catch (err) {
    return false;
  }
  return true;
}

console.log(val("112"));
