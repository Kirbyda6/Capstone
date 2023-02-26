replaceList = ['.env']
for file in replaceList:
    f = open(file, 'r')
    filedata = f.read()
    f.close()

    filedata.replace(":8080", "")
    newdata = filedata.replace("localhost", "galacticgauntlet.com")

    f = open(file, 'w')
    f.write(newdata)
    f.close()

for file in replaceList:
    f = open(file, 'r')
    filedata = f.read()
    f.close()

    newdata = filedata.replace(":8080", "")

    f = open(file, 'w')
    f.write(newdata)
    f.close()
