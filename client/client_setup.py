import os

replaceList = ['index.js']
for file in replaceList:
    f = open(file, 'r')
    filedata = f.read()
    f.close()

    newdata = filedata.replace("8080", "80")

    f = open(file, 'w')
    f.write(newdata)
    f.close()

os.chdir('./public/js')
replaceList = ['game.js', 'main.js', 'player.js']
for file in replaceList:
    f = open(file, 'r')
    filedata = f.read()
    f.close()

    newdata = filedata.replace("localhost", "galacticgauntlet.com")

    f = open(file, 'w')
    f.write(newdata)
    f.close()
