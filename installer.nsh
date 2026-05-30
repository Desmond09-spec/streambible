!macro customInstall
  ; Add a firewall exception for StreamBible during installation to allow WebRTC P2P traffic silently
  ExecWait 'netsh advfirewall firewall add rule name="StreamBible" dir=in action=allow program="$INSTDIR\StreamBible.exe" enable=yes profile=any'
!macroend

!macro customUnInstall
  ; Remove the firewall exception during uninstallation
  ExecWait 'netsh advfirewall firewall delete rule name="StreamBible" program="$INSTDIR\StreamBible.exe"'
!macroend
