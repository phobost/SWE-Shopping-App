{
  pkgs,
  fonts ? with pkgs; [
    liberation_ttf
  ],
}:

let
  proposal-file = ../../../../docs/proposal.typ;
in
(import ../lib.nix { inherit pkgs; }).compileTypstFile proposal-file fonts
