{
  nixpkgs ? (import <nixpkgs> { }),
}:
{

  eachSystem =
    function:
    nixpkgs.lib.genAttrs
      [
        "aarch64-linux"
        "i686-linux"
        "x86_64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ]
      (
        system:
        function (
          import nixpkgs {
            inherit system;
            overlays = [
            ];
          }
        )
      );
}
