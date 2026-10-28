@echo off
rem Opens the portfolio in Edit mode (Remove / Restore pieces) at http://127.0.0.1:8803
cd /d "%~dp0"
start "" pythonw tools\manage.py
