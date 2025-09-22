{
  pkgs ? (import <nixpkgs> { }),
  lib ? pkgs.lib,
}:
{
  compileTypstFile =
    file: fonts:
    pkgs.stdenvNoCC.mkDerivation {
      name = "Compile ${file}";
      src = [
      ];
      buildInputs = [
        pkgs.typst
      ];
      TYPST_FONT_PATHS = lib.concatStringsSep ":" fonts;
      unpackPhase = ''
        cp "${file}" typst-file.typ
      '';
      buildPhase = ''
        typst compile ./typst-file.typ;
      '';
      installPhase = ''
        mkdir -p "$out"
        rm -rf "$out/*" | true
        cp typst-file.pdf $out/
      '';
    };
}
