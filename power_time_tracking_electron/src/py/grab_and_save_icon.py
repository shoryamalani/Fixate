import constants
import requests
import PIL
from PIL import Image
import io
from os import path
def save_website_icon(website_url):
    try:
        getting_icon = True
        size = 256
        while getting_icon:
            size = int(size)
            icon_url = f"https://www.google.com/s2/favicons?sz={size}&domain_url={website_url}" #https://www.google.com/s2/favicons?sz=256&domain_url=stackoverflow.com
            print(icon_url)
            icon = requests.get(icon_url)
            if icon.status_code == 200:
                img = Image.open(io.BytesIO(icon.content))
                height = img.size[0]
                if height >= size:
                    getting_icon = False
                    save_path = path.join(constants.ICON_LOCATION,f"{website_url}.png")
                    img.save(save_path)
                    return save_path
                else:
                    size = size/2
                    if size < 16:
                        raise Exception("Icon too small")
            else:
                raise Exception("Icon not found")

        # this should keep trying to get the icon until it gets the largest one
        else:
            return False
    except Exception as e:
        print(e)
        return False

def save_app_icon(image,app_name):
    try:
        save_path = path.join(constants.ICON_LOCATION,f"{app_name}.png")
        image.save(save_path)
        return save_path
    except Exception as e:
        print(e)
        return False
if __name__ == "__main__":
    save_website_icon("mui.com")