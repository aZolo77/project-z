const userData = (function() {
  const user = {
    name: 'Незнакомец',
    setName: function(val) {
      this.name = val;
    }
  };

  return { user };
})();
